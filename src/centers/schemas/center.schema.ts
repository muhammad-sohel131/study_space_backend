import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Document } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Center extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  location: string;

  @Field()
  @Prop({ required: true })
  openingTime: string; // e.g., '08:00'

  @Field()
  @Prop({ required: true })
  closingTime: string; // e.g., '22:00'

  @Field({ nullable: true })
  @Prop()
  coverImage?: string;

  @Field(() => Boolean, { nullable: true })
  @Prop({ default: true })
  hasStayFacility?: boolean;

  @Field(() => Float, { nullable: true })
  @Prop({ default: 850 })
  stayPricePerNight?: number;

  @Field(() => [String], { nullable: true })
  @Prop({
    type: [String],
    default: [
      '24/7 Dedicated Study Desk Access',
      'Private Quiet Study Pod / Bed',
      'High-Speed WiFi (100 Mbps)',
      'Hot Shower & Clean Restroom',
      'Secure Personal Locker',
      'Complimentary Tea & Filtered Water',
      'Air Conditioned & 24/7 Power Backup',
    ],
  })
  stayAmenities?: string[];

  @Field(() => Int, { nullable: true })
  @Prop({ default: 12 })
  availableStayBeds?: number;

  @Field({ nullable: true })
  @Prop({
    default: 'Check-in: 12:00 PM | Check-out: 11:00 AM. 24/7 access to study zones. Silent hours in sleeping pod zone after 11 PM.',
  })
  stayRules?: string;
}

export const CenterSchema = SchemaFactory.createForClass(Center);
