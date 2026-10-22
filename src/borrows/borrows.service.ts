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
    const pricePerDay = book.borrowPricePerDay || 15;
    const totalCost = pricePerDay * durationDays;

    const borrow = new this.borrowModel({
      userId,
      bookId,
      centerId: book.centerId,
      borrowDate: now,
      dueDate,
      durationDays,
      pricePerDay,
      totalCost,
      paymentStatus: 'paid',
      status: BorrowStatus.BORROWED,
      notes: notes || `Borrowed for ${durationDays} days (Rental Fee: ৳${totalCost})`,
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

    return borrows.map((b) => this.formatBorrow(b));
  }

  async allBorrows(): Promise<Borrow[]> {
    const borrows = await this.borrowModel
      .find()
      .populate('bookId')
      .populate('centerId')
      .populate('userId')
      .sort({ createdAt: -1 })
      .exec();

    return borrows.map((b) => this.formatBorrow(b));
  }

  private async findPopulatedById(id: string): Promise<Borrow> {
    const b = await this.borrowModel
      .findById(id)
      .populate('bookId')
      .populate('centerId')
      .populate('userId')
      .exec();

    if (!b) throw new NotFoundException('Borrow not found');
    return this.formatBorrow(b);
  }

  private formatBorrow(b: any): Borrow {
    const obj: any = b.toObject ? b.toObject() : { ...b };
    obj.id = obj._id?.toString() || obj.id || '';

    // Handle populated Book
    if (obj.bookId && typeof obj.bookId === 'object' && obj.bookId._id) {
      obj.book = {
        ...obj.bookId,
        id: obj.bookId._id.toString(),
      };
      if (obj.book.centerId && typeof obj.book.centerId === 'object' && obj.book.centerId._id) {
        obj.book.center = {
          ...obj.book.centerId,
          id: obj.book.centerId._id.toString(),
        };
        obj.book.centerId = obj.book.center.id;
      }
      obj.bookId = obj.book.id;
    } else if (obj.book && obj.book._id) {
      obj.book.id = obj.book._id.toString();
      obj.bookId = obj.book.id;
    }

    // Handle populated Center
    if (obj.centerId && typeof obj.centerId === 'object' && obj.centerId._id) {
      obj.center = {
        ...obj.centerId,
        id: obj.centerId._id.toString(),
      };
      obj.centerId = obj.center.id;
    } else if (obj.center && obj.center._id) {
      obj.center.id = obj.center._id.toString();
      obj.centerId = obj.center.id;
    }

    // Handle populated User
    if (obj.userId && typeof obj.userId === 'object' && obj.userId._id) {
      obj.user = {
        ...obj.userId,
        id: obj.userId._id.toString(),
      };
      obj.userId = obj.user.id;
    } else if (obj.user && obj.user._id) {
      obj.user.id = obj.user._id.toString();
      obj.userId = obj.user.id;
    }

    const now = new Date();
    if (obj.status === BorrowStatus.BORROWED && new Date(obj.dueDate) < now) {
      obj.status = BorrowStatus.OVERDUE;
    }

    return obj as Borrow;
  }
}
