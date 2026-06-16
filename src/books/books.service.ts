import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { PaginationArgs } from '../common/dto/pagination.args';
import { PaginatedBooks } from './dto/paginated-books.response';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const book = new this.bookModel(createBookInput);
    return book.save();
  }

  async getBooks(paginationArgs: PaginationArgs, centerId?: string): Promise<PaginatedBooks> {
    const { page, limit } = paginationArgs;
    const skip = (page - 1) * limit;
    const filter = centerId ? { centerId } : {};

    const [data, totalCount] = await Promise.all([
      this.bookModel.find(filter).skip(skip).limit(limit).exec(),
      this.bookModel.countDocuments(filter).exec()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return { data, totalCount, totalPages };
  }

  async update(id: string, updateBookInput: UpdateBookInput): Promise<Book> {
    const updatedBook = await this.bookModel.findByIdAndUpdate(id, updateBookInput, { new: true }).exec();
    if (!updatedBook) {
      throw new NotFoundException(`Book with ID ${id} is not found`);
    }
    return updatedBook;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Book with ID ${id} is not found`);
    }
    return true;
  }
}
