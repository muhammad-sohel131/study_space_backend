import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Book } from '../../books/schemas/book.schema';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@ObjectType()
@Schema({ timestamps: true })
export class Order extends Document {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book', required: true })
  bookId: string;

  @Field(() => Int)
  @Prop({ required: true, default: 1 })
  quantity: number;

  @Field()
  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Field()
  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Field(() => Int)
  @Prop({ required: true, default: 0 })
  totalAmount: number;

  @Field(() => Book, { nullable: true })
  book?: Book;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
