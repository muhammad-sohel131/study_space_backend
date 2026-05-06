import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsMongoId, IsEnum, IsDateString } from 'class-validator';

@InputType()
export class CreateBookingInput {
  @Field()
  @IsNotEmpty()
  @IsMongoId()
  seatId: string;

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
  @IsEnum(['hourly', 'monthly'])
  bookingType: string;
}
