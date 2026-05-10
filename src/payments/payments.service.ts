import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment } from './schemas/payment.schema';
import { Booking, BookingStatus, PaymentStatus } from '../bookings/schemas/booking.schema';
import { InitPaymentResponse } from './dto/init-payment.response';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SSLCommerzPayment = require('sslcommerz-lts');

@Injectable()
export class PaymentsService {
  private sslcz: any;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
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
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is cancelled');
    }
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking is already paid');
    }

    const tran_id = `REF_${Date.now()}_${bookingId}`;

    // Create payment record
    const payment = new this.paymentModel({
      bookingId,
      userId,
      amount: booking.totalPrice,
      transactionId: tran_id,
      status: PaymentStatus.PENDING,
    });
    await payment.save();

    const data = {
      total_amount: booking.totalPrice,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `http://localhost:5000/api/payment/success?tran_id=${tran_id}`,
      fail_url: `http://localhost:5000/api/payment/fail?tran_id=${tran_id}`,
      cancel_url: `http://localhost:5000/api/payment/cancel?tran_id=${tran_id}`,
      ipn_url: 'http://localhost:5000/api/payment/ipn',
      shipping_method: 'No',
      product_name: 'Seat Booking',
      product_category: 'Service',
      product_profile: 'general',
      cus_name: 'Student', // In a real app, get from user
      cus_email: 'student@example.com',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
    };

    return new Promise((resolve, reject) => {
      this.sslcz.init(data).then((apiResponse) => {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        if (GatewayPageURL) {
          resolve({ paymentUrl: GatewayPageURL });
        } else {
          reject(new BadRequestException('Failed to generate payment url'));
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  async handleSuccess(tran_id: string): Promise<string> {
    const payment = await this.paymentModel.findOne({ transactionId: tran_id });
    if (!payment) return 'Payment not found';

    payment.status = PaymentStatus.PAID;
    await payment.save();

    await this.bookingModel.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: PaymentStatus.PAID,
      status: BookingStatus.CONFIRMED,
    });

    return 'Payment Successful. You can close this window.';
  }

  async handleFail(tran_id: string): Promise<string> {
    const payment = await this.paymentModel.findOne({ transactionId: tran_id });
    if (!payment) return 'Payment not found';

    payment.status = PaymentStatus.FAILED;
    await payment.save();

    await this.bookingModel.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: PaymentStatus.FAILED,
      status: BookingStatus.CANCELLED,
    });

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
