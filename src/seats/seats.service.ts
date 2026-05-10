import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seat } from './schemas/seat.schema';
import { CreateSeatInput } from './dto/create-seat.input';
import { UpdateSeatInput } from './dto/update-seat.input';

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

  async findById(id: string): Promise<Seat | null> {
    return this.seatModel.findById(id).exec();
  }

  async update(updateSeatInput: UpdateSeatInput): Promise<Seat | null> {
    const { id, ...updateData } = updateSeatInput;
    return this.seatModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.seatModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
