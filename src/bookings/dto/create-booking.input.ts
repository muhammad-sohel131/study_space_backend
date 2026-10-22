import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsMongoId, IsEnum, IsDateString, IsOptional, IsInt, IsString } from 'class-validator';

@InputType()
export class CreateBookingInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsMongoId()
  seatId?: string;

  @Field()
  @IsNotEmpty()
  @IsMongoId()
  centerId: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  startTime: string; // ISO String

  @Field()
  @IsNotEmpty()
  @IsDateString()
  endTime: string; // ISO String

  @Field()
  @IsNotEmpty()
  @IsEnum(['hourly', 'monthly', 'stay'])
  bookingType: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  stayNights?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  roomType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bedUnit?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  guestsCount?: number;
}
