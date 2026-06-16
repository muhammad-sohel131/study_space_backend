import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Document, Schema as MongooseSchema } from 'mongoose';

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
}

export const BookSchema = SchemaFactory.createForClass(Book);
