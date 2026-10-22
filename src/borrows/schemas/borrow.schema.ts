import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Book } from '../../books/schemas/book.schema';
import { Center } from '../../centers/schemas/center.schema';
import { User } from '../../auth/schemas/user.schema';

export enum BorrowStatus {
  BORROWED = 'borrowed',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
}

@ObjectType()
@Schema({ timestamps: true })
export class Borrow extends Document {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book', required: true })
  bookId: string;

  @Field(() => ID, { nullable: true })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Center', required: false })
  centerId?: string;

  @Field()
  @Prop({ required: true, default: Date.now })
  borrowDate: Date;

  @Field()
  @Prop({ required: true })
  dueDate: Date;

  @Field({ nullable: true })
  @Prop({ required: false })
  returnDate?: Date;

  @Field(() => Int)
  @Prop({ required: true, default: 7 })
  durationDays: number;

  @Field(() => Float, { nullable: true, defaultValue: 15 })
  @Prop({ required: false, default: 15 })
  pricePerDay?: number;

  @Field(() => Float, { nullable: true, defaultValue: 105 })
  @Prop({ required: false, default: 105 })
  totalCost?: number;

  @Field({ nullable: true, defaultValue: 'paid' })
  @Prop({ required: false, default: 'paid' })
  paymentStatus?: string;

  @Field()
  @Prop({ required: true, enum: BorrowStatus, default: BorrowStatus.BORROWED })
  status: BorrowStatus;

  @Field({ nullable: true })
  @Prop({ required: false })
  notes?: string;

  @Field(() => Book, { nullable: true })
  book?: Book;

  @Field(() => Center, { nullable: true })
  center?: Center;

  @Field(() => User, { nullable: true })
  user?: User;
}

export const BorrowSchema = SchemaFactory.createForClass(Borrow);
