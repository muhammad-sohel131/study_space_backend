import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

@InputType()
export class CreateSeatInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  seatNumber: string;

  @Field()
  @IsNotEmpty()
  @IsMongoId()
  centerId: string;

  @Field()
  @IsNotEmpty()
  @IsEnum(['regular', 'premium'])
  type: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  pricePerHour: number;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  pricePerMonth: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  x?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  y?: number;
}
