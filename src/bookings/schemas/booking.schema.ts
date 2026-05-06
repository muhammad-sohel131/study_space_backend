import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@ObjectType()
@Schema({ timestamps: true })
export class Booking extends Document {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Seat', required: true })
  seatId: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Center', required: true })
  centerId: string;

  @Field()
  @Prop({ required: true })
  startTime: Date;

  @Field()
  @Prop({ required: true })
  endTime: Date;

  @Field()
  @Prop({ required: true, enum: ['hourly', 'monthly'] })
  bookingType: string;

  @Field(() => Float)
  @Prop({ required: true })
  totalPrice: number;

  @Field()
  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Field()
  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
