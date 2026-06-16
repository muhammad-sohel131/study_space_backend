import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus, PaymentStatus } from './schemas/order.schema';
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
    if (book.stock < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const order = new this.orderModel({
      userId,
      bookId,
      quantity,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount: book.price * quantity,
    });

    return order.save();
  }

  async myOrders(userId: string): Promise<Order[]> {
    const orders = await this.orderModel.find({ userId }).populate('bookId').sort({ createdAt: -1 }).exec();
    return orders.map(order => {
      const obj: any = order.toObject();
      obj.book = obj.bookId;
      obj.bookId = obj.book?._id?.toString() || '';
      obj.id = obj._id?.toString() || '';
      return obj as Order;
    });
  }
}
