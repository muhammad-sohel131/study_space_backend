import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingStatus } from './schemas/booking.schema';
import { CreateBookingInput } from './dto/create-booking.input';
import { Seat } from '../seats/schemas/seat.schema';
import { Center } from '../centers/schemas/center.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Seat.name) private seatModel: Model<Seat>,
    @InjectModel(Center.name) private centerModel: Model<Center>,
  ) {}

  private isWithinCenterHours(time: Date, openingTime: string, closingTime: string): boolean {
    const hours = time.getUTCHours();
    const minutes = time.getUTCMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return timeStr >= openingTime && timeStr <= closingTime;
  }

  async create(userId: string, createBookingInput: CreateBookingInput): Promise<Booking> {
    const { seatId, centerId, startTime, endTime, bookingType } = createBookingInput;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Validate Center and Hours
    const center = await this.centerModel.findById(centerId);
    if (!center) throw new NotFoundException('Center not found');

    if (bookingType === 'hourly') {
        if (!this.isWithinCenterHours(start, center.openingTime, center.closingTime) ||
            !this.isWithinCenterHours(end, center.openingTime, center.closingTime)) {
            throw new BadRequestException(`Booking must be within center hours: ${center.openingTime} - ${center.closingTime}`);
        }
    }

    // 2. Check for Overlap
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

    // 3. Calculate price
    let totalPrice = 0;
    if (bookingType === 'hourly') {
      const hours = Math.abs(end.getTime() - start.getTime()) / 36e5;
      totalPrice = hours * seat.pricePerHour;
    } else {
      totalPrice = seat.pricePerMonth;
    }

    const booking = new this.bookingModel({
      userId,
      seatId,
      centerId,
      startTime: start,
      endTime: end,
      bookingType,
      totalPrice,
      status: BookingStatus.PENDING,
    });

    return booking.save();
  }

  async getMyBookings(userId: string): Promise<Booking[]> {
    return this.bookingModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().sort({ createdAt: -1 }).exec();
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

    const bookedSeatIds = overlappingBookings.map((b) => b.seatId.toString());

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
}
