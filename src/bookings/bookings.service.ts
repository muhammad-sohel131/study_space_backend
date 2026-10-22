import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingStatus } from './schemas/booking.schema';
import { CreateBookingInput } from './dto/create-booking.input';
import { Seat } from '../seats/schemas/seat.schema';
import { Center } from '../centers/schemas/center.schema';
import { PaginationArgs } from '../common/dto/pagination.args';
import { PaginatedBookings } from './dto/paginated-bookings.response';
import { StayAvailability } from './dto/stay-availability.response';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Seat.name) private seatModel: Model<Seat>,
    @InjectModel(Center.name) private centerModel: Model<Center>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleStaleBookings() {
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const result = await this.bookingModel.updateMany(
      {
        status: BookingStatus.PENDING,
        createdAt: { $lt: tenMinutesAgo }
      },
      { status: BookingStatus.CANCELLED }
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`Auto-cancelled ${result.modifiedCount} stale pending bookings.`);
    }
  }

  private isWithinCenterHours(time: Date, openingTime: string, closingTime: string): boolean {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return timeStr >= openingTime && timeStr <= closingTime;
  }

  async create(userId: string, createBookingInput: CreateBookingInput): Promise<Booking> {
    const { seatId, centerId, startTime, endTime, bookingType, stayNights, roomType, guestsCount } = createBookingInput;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Validate Center
    const center = await this.centerModel.findById(centerId);
    if (!center) throw new NotFoundException('Center not found');

    let totalPrice = 0;
    let assignedBedUnit: string | undefined = undefined;

    if (bookingType === 'stay') {
      if (center.hasStayFacility === false) {
        throw new BadRequestException('This study center does not currently offer overnight stay facilities');
      }

      // Bed availability check for stay
      const availability = await this.getStayAvailability(centerId, startTime, endTime);
      const reqGuests = guestsCount || 1;
      const targetRoom = roomType || 'Standard Study Pod';

      const catAvail = availability.roomTypeBreakdown.find(
        (r) => r.roomType.toLowerCase() === targetRoom.toLowerCase()
      ) || availability.roomTypeBreakdown[0];

      if (!catAvail || catAvail.emptyBeds < reqGuests) {
        throw new BadRequestException(
          `Sorry, all beds for "${targetRoom}" are fully booked for these dates (0 empty beds available). Please select another accommodation type or change dates.`
        );
      }

      assignedBedUnit = createBookingInput.bedUnit;
      if (assignedBedUnit) {
        const matchingUnit = catAvail.bedUnits.find((u) => u.unitNumber === assignedBedUnit);
        if (matchingUnit && matchingUnit.isBooked) {
          throw new ConflictException(
            `Selected bed unit "${assignedBedUnit}" is already booked for these dates. Please choose an empty bed unit.`
          );
        }
      } else {
        // Auto-assign first empty unit in that category
        assignedBedUnit = catAvail.bedUnits.find((u) => !u.isBooked)?.unitNumber;
      }

      // Calculate nights
      const nights = stayNights || Math.max(1, Math.round(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const basePerNight = center.stayPricePerNight || 850;
      let ratePerNight = basePerNight;

      const rType = roomType || 'Standard Study Pod';
      if (rType.toLowerCase().includes('executive')) {
        ratePerNight = Math.round(basePerNight * 1.35);
      } else if (rType.toLowerCase().includes('bunk') || rType.toLowerCase().includes('shared')) {
        ratePerNight = Math.round(basePerNight * 0.8);
      }

      // Multi-night discount: 5% for 3+ nights, 10% for 7+ nights
      if (nights >= 7) {
        ratePerNight = Math.round(ratePerNight * 0.9);
      } else if (nights >= 3) {
        ratePerNight = Math.round(ratePerNight * 0.95);
      }

      totalPrice = ratePerNight * nights;

      // If a specific study desk/seat was selected for 24/7 access during stay, check overlap
      if (seatId) {
        const existingBooking = await this.bookingModel.findOne({
          seatId,
          status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
          startTime: { $lt: end },
          endTime: { $gt: start },
        });

        if (existingBooking) {
          throw new ConflictException('Selected study desk is already reserved for this duration');
        }
      }
    } else {
      // Hourly or Monthly Seat Booking
      if (!seatId) {
        throw new BadRequestException('Seat selection is required for hourly and monthly bookings');
      }

      if (bookingType === 'hourly') {
        if (!this.isWithinCenterHours(start, center.openingTime, center.closingTime) ||
            !this.isWithinCenterHours(end, center.openingTime, center.closingTime)) {
            throw new BadRequestException(`Booking must be within center hours: ${center.openingTime} - ${center.closingTime}`);
        }
      }

      // Check for Overlap
      const existingBooking = await this.bookingModel.findOne({
        seatId,
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        startTime: { $lt: end },
        endTime: { $gt: start },
      });

      if (existingBooking) {
        throw new ConflictException('Seat is already booked for the given time frame');
      }

      const seat = await this.seatModel.findById(seatId);
      if (!seat) throw new NotFoundException('Seat not found');

      if (bookingType === 'hourly') {
        const hours = Math.abs(end.getTime() - start.getTime()) / 36e5;
        totalPrice = hours * seat.pricePerHour;
      } else {
        totalPrice = seat.pricePerMonth;
      }
    }

    const booking = new this.bookingModel({
      userId,
      seatId: seatId || undefined,
      centerId,
      startTime: start,
      endTime: end,
      bookingType,
      stayNights: bookingType === 'stay' ? (stayNights || Math.max(1, Math.round(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))) : undefined,
      roomType: bookingType === 'stay' ? (roomType || 'Standard Study Pod') : undefined,
      bedUnit: bookingType === 'stay' ? assignedBedUnit : undefined,
      guestsCount: guestsCount || 1,
      totalPrice,
      status: BookingStatus.PENDING,
    });

    return booking.save();
  }

  async getMyBookings(userId: string, paginationArgs: PaginationArgs): Promise<PaginatedBookings> {
    const { page, limit } = paginationArgs;
    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      this.bookingModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.bookingModel.countDocuments({ userId }).exec()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return { data, totalCount, totalPages };
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedBookings> {
    const { page, limit } = paginationArgs;
    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      this.bookingModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.bookingModel.countDocuments().exec()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return { data, totalCount, totalPages };
  }

  async cancelBooking(userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingModel.findOne({ _id: bookingId, userId });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = BookingStatus.CANCELLED;
    return booking.save();
  }

  async getAvailableSeats(centerId: string, startTime: string, endTime: string): Promise<Seat[]> {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Find bookings that overlap
    const overlappingBookings = await this.bookingModel.find({
      centerId,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    const bookedSeatIds = overlappingBookings.filter((b) => b.seatId).map((b) => b.seatId!.toString());

    // Find seats in the center that are not in the bookedSeatIds
    const availableSeats = await this.seatModel.find({
      centerId,
      isActive: true,
      _id: { $nin: bookedSeatIds },
    });

    return availableSeats;
  }

  async findBySeat(seatId: string): Promise<Booking[]> {
    return this.bookingModel.find({
      seatId,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      endTime: { $gt: new Date() },
    }).sort({ startTime: 1 }).exec();
  }

  async getStayAvailability(centerId: string, startTime: string, endTime: string): Promise<StayAvailability> {
    const center = await this.centerModel.findById(centerId);
    if (!center) throw new NotFoundException('Center not found');

    const totalBeds = center.availableStayBeds || 12;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Standard: ~50%, Executive: ~25%, Shared Dorm: Remaining
    const standardTotal = Math.max(1, Math.floor(totalBeds * 0.5));
    const executiveTotal = Math.max(1, Math.floor(totalBeds * 0.25));
    const sharedTotal = Math.max(1, totalBeds - standardTotal - executiveTotal);

    const categoriesConfig = [
      {
        roomType: 'Standard Study Pod',
        prefix: 'Pod S',
        totalBeds: standardTotal,
      },
      {
        roomType: 'Executive Private Suite',
        prefix: 'Suite E',
        totalBeds: executiveTotal,
      },
      {
        roomType: 'Shared Scholar Dorm (Bunk)',
        prefix: 'Bunk D',
        totalBeds: sharedTotal,
      },
    ];

    const overlappingStayBookings = await this.bookingModel.find({
      centerId,
      bookingType: 'stay',
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    const roomTypeBreakdown = categoriesConfig.map((cat) => {
      // Find bookings belonging to this room category
      const catBookings = overlappingStayBookings.filter((b) => {
        const bType = (b.roomType || 'Standard Study Pod').toLowerCase();
        if (cat.roomType.includes('Standard') && (bType.includes('standard') || bType.includes('pod s'))) return true;
        if (cat.roomType.includes('Executive') && (bType.includes('executive') || bType.includes('suite e'))) return true;
        if (cat.roomType.includes('Shared') && (bType.includes('shared') || bType.includes('bunk') || bType.includes('dorm'))) return true;
        return false;
      });

      const assignedBookedUnits = new Set<string>();
      for (const b of catBookings) {
        if (b.bedUnit) {
          assignedBookedUnits.add(b.bedUnit);
        }
      }

      let unassignedBookedCount = catBookings
        .filter((b) => !b.bedUnit)
        .reduce((sum, b) => sum + (b.guestsCount || 1), 0);

      const units: { unitNumber: string; isBooked: boolean }[] = [];
      for (let i = 1; i <= cat.totalBeds; i++) {
        const unitNumber = `${cat.prefix}${i}`;
        let isBooked = assignedBookedUnits.has(unitNumber);
        if (!isBooked && unassignedBookedCount > 0) {
          isBooked = true;
          unassignedBookedCount--;
        }
        units.push({
          unitNumber,
          isBooked,
        });
      }

      const bookedCount = units.filter((u) => u.isBooked).length;
      const emptyCount = Math.max(0, cat.totalBeds - bookedCount);

      return {
        roomType: cat.roomType,
        totalBeds: cat.totalBeds,
        bookedBeds: bookedCount,
        emptyBeds: emptyCount,
        isAvailable: emptyCount > 0,
        bedUnits: units,
      };
    });

    const bookedBeds = roomTypeBreakdown.reduce((sum, r) => sum + r.bookedBeds, 0);
    const availableBeds = Math.max(0, totalBeds - bookedBeds);
    const isAvailable = availableBeds > 0;

    let statusNote = 'Plenty of beds available';
    if (availableBeds === 0) {
      statusNote = 'Sold out for these dates';
    } else if (availableBeds <= 3) {
      statusNote = `High demand: Only ${availableBeds} bed${availableBeds > 1 ? 's' : ''} left!`;
    }

    return {
      totalBeds,
      bookedBeds,
      availableBeds,
      isAvailable,
      statusNote,
      roomTypeBreakdown,
    };
  }
}
