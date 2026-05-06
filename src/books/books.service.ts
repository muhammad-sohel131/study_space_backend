import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';
import { CreateBookInput } from './dto/create-book.input';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const book = new this.bookModel(createBookInput);
    return book.save();
  }

  async findAll(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  async findByCenter(centerId: string): Promise<Book[]> {
    return this.bookModel.find({ centerId }).exec();
  }
}
