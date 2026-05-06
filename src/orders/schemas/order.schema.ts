import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RETURNED = 'returned', // only for borrow
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

  @Field()
  @Prop({ required: true, enum: ['purchase', 'borrow'] })
  type: string;

  @Field(() => Int)
  @Prop({ required: true, default: 1 })
  quantity: number;

  @Field()
  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
