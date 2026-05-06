import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seat } from './schemas/seat.schema';
import { CreateSeatInput } from './dto/create-seat.input';

@Injectable()
export class SeatsService {
  constructor(@InjectModel(Seat.name) private seatModel: Model<Seat>) {}

  async create(createSeatInput: CreateSeatInput): Promise<Seat> {
    const seat = new this.seatModel(createSeatInput);
    return seat.save();
  }

  async findByCenter(centerId: string): Promise<Seat[]> {
    return this.seatModel.find({ centerId, isActive: true }).exec();
  }
}
