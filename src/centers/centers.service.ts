import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Center } from './schemas/center.schema';
import { CreateCenterInput } from './dto/create-center.input';

@Injectable()
export class CentersService {
  constructor(@InjectModel(Center.name) private centerModel: Model<Center>) {}

  async create(createCenterInput: CreateCenterInput): Promise<Center> {
    const center = new this.centerModel(createCenterInput);
    return center.save();
  }

  async findAll(): Promise<Center[]> {
    return this.centerModel.find().exec();
  }
}
