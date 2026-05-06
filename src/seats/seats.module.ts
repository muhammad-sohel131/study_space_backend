import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeatsService } from './seats.service';
import { SeatsResolver } from './seats.resolver';
import { Seat, SeatSchema } from './schemas/seat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Seat.name, schema: SeatSchema }])],
  providers: [SeatsService, SeatsResolver],
  exports: [SeatsService],
})
export class SeatsModule {}
