import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsResolver } from './bookings.resolver';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Seat, SeatSchema } from '../seats/schemas/seat.schema';
import { Center, CenterSchema } from '../centers/schemas/center.schema';
import { SeatsModule } from '../seats/seats.module';
import { CentersModule } from '../centers/centers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Seat.name, schema: SeatSchema },
      { name: Center.name, schema: CenterSchema },
    ]),
    SeatsModule,
    CentersModule,
  ],
  providers: [BookingsService, BookingsResolver],
  exports: [BookingsService],
})
export class BookingsModule {}
