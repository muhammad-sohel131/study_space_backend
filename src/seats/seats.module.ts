import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeatsService } from './seats.service';
import { SeatsResolver } from './seats.resolver';
import { Seat, SeatSchema } from './schemas/seat.schema';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Seat.name, schema: SeatSchema }]),
    forwardRef(() => BookingsModule),
  ],
  providers: [SeatsService, SeatsResolver],
  exports: [SeatsService],
})
export class SeatsModule {}
