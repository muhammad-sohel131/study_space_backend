import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus, PaymentStatus, DeliveryStatus } from './schemas/order.schema';
import { CreateOrderInput } from './dto/create-order.input';
import { Book } from '../books/schemas/book.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
  ) {}

  async buyBook(userId: string, createOrderInput: CreateOrderInput): Promise<Order> {
    const { items } = createOrderInput;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let totalAmount = 0;
    const validatedItems: { bookId: string; quantity: number }[] = [];

    for (const item of items) {
      const book = await this.bookModel.findById(item.bookId);
      if (!book) {
        throw new NotFoundException(`Book not found for ID: ${item.bookId}`);
      }
      if (book.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for book: ${book.title}`);
      }
      totalAmount += book.price * item.quantity;
      validatedItems.push({ bookId: item.bookId, quantity: item.quantity });
    }

    const order = new this.orderModel({
      userId,
      items: validatedItems,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount,
    });

    return order.save();
  }

  async myOrders(userId: string): Promise<Order[]> {
    const orders = await this.orderModel.find({ userId }).populate('items.bookId').sort({ createdAt: -1 }).exec();
    return orders.map(order => {
      const obj: any = order.toObject();
      obj.id = obj._id?.toString() || '';
      if (obj.items && Array.isArray(obj.items)) {
        obj.items = obj.items.map((item: any) => {
          item.book = item.bookId;
          item.bookId = item.book?._id?.toString() || '';
          return item;
        });
      }
      return obj as Order;
    });
  }

  async allOrders(): Promise<Order[]> {
    const orders = await this.orderModel.find().populate('items.bookId').sort({ createdAt: -1 }).exec();
    return orders.map(order => {
      const obj: any = order.toObject();
      obj.id = obj._id?.toString() || '';
      if (obj.items && Array.isArray(obj.items)) {
        obj.items = obj.items.map((item: any) => {
          item.book = item.bookId;
          item.bookId = item.book?._id?.toString() || '';
          return item;
        });
      }
      return obj as Order;
    });
  }

  async markDelivered(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    order.deliveryStatus = DeliveryStatus.DELIVERED;
    return order.save();
  }

  async autoDeliverSoftProducts(): Promise<number> {
    // Find paid orders where items may include pdf books - mark as delivered
    const orders = await this.orderModel.find({ paymentStatus: PaymentStatus.PAID, deliveryStatus: DeliveryStatus.PENDING }).populate('items.bookId').exec();
    let count = 0;
    for (const order of orders) {
      const allSoft = (order.items as any[]).every((item: any) => {
        const book = item.bookId;
        return book && book.productType === 'pdf';
      });
      if (allSoft) {
        order.deliveryStatus = DeliveryStatus.DELIVERED;
        await order.save();
        count++;
      }
    }
    return count;
  }
}
