import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Borrow, BorrowStatus } from './schemas/borrow.schema';
import { BorrowBookInput } from './dto/borrow-book.input';
import { Book } from '../books/schemas/book.schema';

@Injectable()
export class BorrowsService {
  constructor(
    @InjectModel(Borrow.name) private borrowModel: Model<Borrow>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
  ) {}

  async borrowBook(userId: string, input: BorrowBookInput): Promise<Borrow> {
    const { bookId, durationDays = 7, notes } = input;

    const book = await this.bookModel.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book not found for ID: ${bookId}`);
    }

    if (book.productType === 'pdf') {
      throw new BadRequestException('E-Books (PDF) can be downloaded directly and do not need to be borrowed.');
    }

    if (book.stock <= 0) {
      throw new BadRequestException(`No physical copies currently available for "${book.title}". All copies are checked out.`);
    }

    // Decrement stock by 1
    book.stock -= 1;
    await book.save();

    const now = new Date();
    const dueDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const borrow = new this.borrowModel({
      userId,
      bookId,
      centerId: book.centerId,
      borrowDate: now,
      dueDate,
      durationDays,
      status: BorrowStatus.BORROWED,
      notes: notes || `Borrowed from study center for ${durationDays} days`,
    });

    const saved = await borrow.save();
    return this.findPopulatedById(saved._id.toString());
  }

  async returnBook(userId: string, borrowId: string, isAdmin: boolean = false): Promise<Borrow> {
    const borrow = await this.borrowModel.findById(borrowId);
    if (!borrow) {
      throw new NotFoundException('Borrow record not found');
    }

    if (!isAdmin && borrow.userId.toString() !== userId) {
      throw new ForbiddenException('You can only return books that you borrowed');
    }

    if (borrow.status === BorrowStatus.RETURNED) {
      throw new BadRequestException('This book has already been marked as returned');
    }

    // Increment book stock by 1
    const book = await this.bookModel.findById(borrow.bookId);
    if (book) {
      book.stock += 1;
      await book.save();
    }

    borrow.status = BorrowStatus.RETURNED;
    borrow.returnDate = new Date();
    await borrow.save();

    return this.findPopulatedById(borrowId);
  }

  async myBorrows(userId: string): Promise<Borrow[]> {
    const borrows = await this.borrowModel
      .find({ userId })
      .populate('bookId')
      .populate('centerId')
      .sort({ createdAt: -1 })
      .exec();

    const now = new Date();
    return borrows.map((b) => {
      const obj: any = b.toObject();
      obj.id = obj._id?.toString() || '';
      obj.book = obj.bookId;
      obj.bookId = obj.book?._id?.toString() || '';
      obj.center = obj.centerId;
      obj.centerId = obj.center?._id?.toString() || '';

      // Check overdue dynamically
      if (obj.status === BorrowStatus.BORROWED && new Date(obj.dueDate) < now) {
        obj.status = BorrowStatus.OVERDUE;
      }
      return obj as Borrow;
    });
  }

  async allBorrows(): Promise<Borrow[]> {
    const borrows = await this.borrowModel
      .find()
      .populate('bookId')
      .populate('centerId')
      .populate('userId')
      .sort({ createdAt: -1 })
      .exec();

    const now = new Date();
    return borrows.map((b) => {
      const obj: any = b.toObject();
      obj.id = obj._id?.toString() || '';
      obj.book = obj.bookId;
      obj.bookId = obj.book?._id?.toString() || '';
      obj.center = obj.centerId;
      obj.centerId = obj.center?._id?.toString() || '';
      obj.user = obj.userId;
      obj.userId = obj.user?._id?.toString() || '';

      if (obj.status === BorrowStatus.BORROWED && new Date(obj.dueDate) < now) {
        obj.status = BorrowStatus.OVERDUE;
      }
      return obj as Borrow;
    });
  }

  private async findPopulatedById(id: string): Promise<Borrow> {
    const b = await this.borrowModel
      .findById(id)
      .populate('bookId')
      .populate('centerId')
      .populate('userId')
      .exec();

    if (!b) throw new NotFoundException('Borrow not found');
    const obj: any = b.toObject();
    obj.id = obj._id?.toString() || '';
    obj.book = obj.bookId;
    obj.bookId = obj.book?._id?.toString() || '';
    obj.center = obj.centerId;
    obj.centerId = obj.center?._id?.toString() || '';
    obj.user = obj.userId;
    obj.userId = obj.user?._id?.toString() || '';
    return obj as Borrow;
  }
}
