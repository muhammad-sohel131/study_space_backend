import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsMongoId, Min } from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  author: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @Field()
  @IsNotEmpty()
  @IsEnum(['sell', 'borrow'])
  type: string;

  @Field()
  @IsNotEmpty()
  @IsMongoId()
  centerId: string;
}
