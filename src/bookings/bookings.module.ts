import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsResolver } from './bookings.resolver';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Seat, SeatSchema } from '../seats/schemas/seat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Seat.name, schema: SeatSchema },
    ]),
  ],
  providers: [BookingsService, BookingsResolver],
  exports: [BookingsService],
})
export class BookingsModule {}
