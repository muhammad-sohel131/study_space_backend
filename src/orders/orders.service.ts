import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './schemas/order.schema';
import { CreateOrderInput } from './dto/create-order.input';
import { Book } from '../books/schemas/book.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
  ) {}

  async buyBook(userId: string, createOrderInput: CreateOrderInput): Promise<Order> {
    const { bookId, quantity } = createOrderInput;

    const book = await this.bookModel.findById(bookId);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.type !== 'sell') {
      throw new BadRequestException('This book is not for sale');
    }
    if (book.stock < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    // Reduce stock
    book.stock -= quantity;
    await book.save();

    const order = new this.orderModel({
      userId,
      bookId,
      type: 'purchase',
      quantity,
      status: OrderStatus.CONFIRMED, // Assume confirmed immediately for simplicity, could be integrated with payment
    });

    return order.save();
  }

  async borrowBook(userId: string, createOrderInput: CreateOrderInput): Promise<Order> {
    const { bookId, quantity } = createOrderInput;

    const book = await this.bookModel.findById(bookId);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.type !== 'borrow') {
      throw new BadRequestException('This book is not for borrow');
    }
    if (book.stock < quantity) {
      throw new BadRequestException('Not enough stock to borrow');
    }

    // Reduce stock
    book.stock -= quantity;
    await book.save();

    const order = new this.orderModel({
      userId,
      bookId,
      type: 'borrow',
      quantity,
      status: OrderStatus.CONFIRMED,
    });

    return order.save();
  }

  async returnBook(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: orderId, userId, type: 'borrow' });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === OrderStatus.RETURNED) {
      throw new BadRequestException('Book already returned');
    }

    order.status = OrderStatus.RETURNED;
    await order.save();

    // Increase stock
    const book = await this.bookModel.findById(order.bookId);
    if (book) {
      book.stock += order.quantity;
      await book.save();
    }

    return order;
  }
}
