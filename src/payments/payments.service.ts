import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment } from './schemas/payment.schema';
import { Booking, BookingStatus, PaymentStatus } from '../bookings/schemas/booking.schema';
import { Order, OrderStatus, PaymentStatus as OrderPaymentStatus } from '../orders/schemas/order.schema';
import { Book } from '../books/schemas/book.schema';
import { InitPaymentResponse } from './dto/init-payment.response';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SSLCommerzPayment = require('sslcommerz-lts');

@Injectable()
export class PaymentsService {
  private sslcz: any;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    private configService: ConfigService,
  ) {
    const store_id = this.configService.get<string>('SSLCOMMERZ_STORE_ID');
    const store_passwd = this.configService.get<string>('SSLCOMMERZ_STORE_PASSWORD');
    const is_live = this.configService.get<string>('SSLCOMMERZ_IS_SANDBOX') === 'false';
    this.sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().sort({ createdAt: -1 }).exec();
  }

  async initPayment(userId: string, bookingId: string): Promise<InitPaymentResponse> {
    const booking = await this.bookingModel.findOne({ _id: bookingId, userId });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === BookingStatus.CANCELLED) throw new BadRequestException('Booking is cancelled');
    if (booking.paymentStatus === PaymentStatus.PAID) throw new BadRequestException('Booking is already paid');

    const tran_id = `REF_${Date.now()}_${bookingId}`;
    const payment = new this.paymentModel({ bookingId, userId, amount: booking.totalPrice, transactionId: tran_id, status: PaymentStatus.PENDING });
    await payment.save();

    const data = this.buildPaymentData(booking.totalPrice, tran_id, 'Seat Booking');
    return this.processSslczInit(data);
  }

  async initOrderPayment(userId: string, orderId: string): Promise<InitPaymentResponse> {
    const order = await this.orderModel.findOne({ _id: orderId, userId });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === OrderPaymentStatus.PAID) throw new BadRequestException('Order is already paid');

    const tran_id = `ORD_${Date.now()}_${orderId}`;
    const payment = new this.paymentModel({ orderId, userId, amount: order.totalAmount, transactionId: tran_id, status: PaymentStatus.PENDING });
    await payment.save();

    const data = this.buildPaymentData(order.totalAmount, tran_id, 'Book Purchase');
    return this.processSslczInit(data);
  }

  private buildPaymentData(amount: number, tran_id: string, product_name: string) {
    return {
      total_amount: amount,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `http://localhost:5000/api/payment/success?tran_id=${tran_id}`,
      fail_url: `http://localhost:5000/api/payment/fail?tran_id=${tran_id}`,
      cancel_url: `http://localhost:5000/api/payment/cancel?tran_id=${tran_id}`,
      ipn_url: 'http://localhost:5000/api/payment/ipn',
      shipping_method: 'No',
      product_name: product_name,
      product_category: 'Service',
      product_profile: 'general',
      cus_name: 'Student',
      cus_email: 'student@example.com',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
    };
  }

  private processSslczInit(data: any): Promise<InitPaymentResponse> {
    return new Promise((resolve, reject) => {
      this.sslcz.init(data).then((apiResponse) => {
        if (apiResponse.GatewayPageURL) resolve({ paymentUrl: apiResponse.GatewayPageURL });
        else reject(new BadRequestException('Failed to generate payment url'));
      }).catch(reject);
    });
  }

  async handleSuccess(tran_id: string): Promise<string> {
    const payment = await this.paymentModel.findOne({ transactionId: tran_id });
    if (!payment) return 'Payment not found';

    payment.status = PaymentStatus.PAID;
    await payment.save();

    if (payment.bookingId) {
      await this.bookingModel.findByIdAndUpdate(payment.bookingId, { paymentStatus: PaymentStatus.PAID, status: BookingStatus.CONFIRMED });
    } else if (payment.orderId) {
      const order = await this.orderModel.findByIdAndUpdate(payment.orderId, { paymentStatus: OrderPaymentStatus.PAID, status: OrderStatus.CONFIRMED }, { new: true }).populate('items.bookId');
      if (order && order.items && order.items.length > 0) {
        let allPdf = true;
        for (const item of order.items) {
          const book = await this.bookModel.findById((item as any).bookId?._id || item.bookId);
          if (book) {
            book.stock -= item.quantity;
            await book.save();
            if (book.productType !== 'pdf') allPdf = false;
          }
        }
        // Auto-deliver if all items are soft/PDF products
        if (allPdf) {
          order.deliveryStatus = 'delivered' as any;
          await order.save();
        }
      }
    }
    return 'Payment Successful. You can close this window.';
  }

  async handleFail(tran_id: string): Promise<string> {
    const payment = await this.paymentModel.findOne({ transactionId: tran_id });
    if (!payment) return 'Payment not found';

    payment.status = PaymentStatus.FAILED;
    await payment.save();

    if (payment.bookingId) {
      await this.bookingModel.findByIdAndUpdate(payment.bookingId, { paymentStatus: PaymentStatus.FAILED, status: BookingStatus.CANCELLED });
    } else if (payment.orderId) {
      await this.orderModel.findByIdAndUpdate(payment.orderId, { paymentStatus: OrderPaymentStatus.FAILED });
    }
    return 'Payment Failed.';
  }

  async handleCancel(tran_id: string): Promise<string> {
    const payment = await this.paymentModel.findOne({ transactionId: tran_id });
    if (!payment) return 'Payment not found';

    payment.status = PaymentStatus.FAILED;
    await payment.save();
    return 'Payment Cancelled.';
  }
}
