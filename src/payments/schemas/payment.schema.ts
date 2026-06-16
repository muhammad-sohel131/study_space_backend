import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PaymentStatus } from '../../bookings/schemas/booking.schema';

@ObjectType()
@Schema({ timestamps: true })
export class Payment extends Document {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Booking', required: false })
  bookingId?: string;

  @Field(() => ID, { nullable: true })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: false })
  orderId?: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Field(() => Float)
  @Prop({ required: true })
  amount: number;

  @Field()
  @Prop({ required: true })
  transactionId: string;

  @Field()
  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
