import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingStatus } from './schemas/booking.schema';
import { CreateBookingInput } from './dto/create-booking.input';
import { Seat } from '../seats/schemas/seat.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Seat.name) private seatModel: Model<Seat>,
  ) {}

  async create(userId: string, createBookingInput: CreateBookingInput): Promise<Booking> {
    const { seatId, centerId, startTime, endTime, bookingType } = createBookingInput;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check for overlap
    const existingBooking = await this.bookingModel.findOne({
      seatId,
      status: { $ne: BookingStatus.CANCELLED },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (existingBooking) {
      throw new ConflictException('Seat is already booked for the given time frame');
    }

    const seat = await this.seatModel.findById(seatId);
    if (!seat) {
      throw new NotFoundException('Seat not found');
    }

    // Calculate price
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
    });

    return booking.save();
  }

  async getMyBookings(userId: string): Promise<Booking[]> {
    return this.bookingModel.find({ userId }).exec();
  }

  async cancelBooking(userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingModel.findOne({ _id: bookingId, userId });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

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
}
