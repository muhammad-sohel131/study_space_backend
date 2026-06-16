import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';

import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Book, BookSchema } from '../books/schemas/book.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Book.name, schema: BookSchema },
    ]),
  ],
  providers: [PaymentsService, PaymentsResolver],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
