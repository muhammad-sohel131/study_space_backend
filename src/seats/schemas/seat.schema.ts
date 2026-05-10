import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Booking } from '../../bookings/schemas/booking.schema';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Center } from '../../centers/schemas/center.schema';

@ObjectType()
@Schema({ timestamps: true })
export class Seat extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true })
  seatNumber: string; // e.g., A1, B2

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Center', required: true })
  centerId: string;

  @Field()
  @Prop({ required: true, enum: ['regular', 'premium'], default: 'regular' })
  type: string;

  @Field(() => Float)
  @Prop({ required: true })
  pricePerHour: number;

  @Field(() => Float)
  @Prop({ required: true })
  pricePerMonth: number;

  @Field()
  @Prop({ default: true })
  isActive: boolean;

  @Field(() => Int, { nullable: true })
  @Prop()
  x?: number;

  @Field(() => Int, { nullable: true })
  @Prop()
  y?: number;

  @Field(() => [Booking], { nullable: true })
  bookings?: Booking[];
}

export const SeatSchema = SchemaFactory.createForClass(Seat);
