import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Center } from '../../centers/schemas/center.schema';

@ObjectType()
@Schema({ timestamps: true })
export class Book extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  author: string;

  @Field(() => Float)
  @Prop({ required: true })
  price: number;

  @Field(() => Float, { nullable: true, defaultValue: 15 })
  @Prop({ required: false, default: 15 })
  borrowPricePerDay?: number;

  @Field(() => Int)
  @Prop({ required: true, default: 0 })
  stock: number;

  @Field()
  @Prop({ required: true, enum: ['pdf', 'physical'] })
  productType: string;

  @Field({ nullable: true })
  @Prop()
  coverImageUrl?: string;

  @Field({ nullable: true })
  @Prop()
  previewPdfUrl?: string;

  @Field({ nullable: true })
  @Prop()
  fullPdfUrl?: string;

  @Field(() => ID)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Center', required: true })
  centerId: string;

  @Field(() => Center, { nullable: true })
  center?: Center;
}

export const BookSchema = SchemaFactory.createForClass(Book);
