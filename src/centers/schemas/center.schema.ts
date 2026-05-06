import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
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
}

export const CenterSchema = SchemaFactory.createForClass(Center);
