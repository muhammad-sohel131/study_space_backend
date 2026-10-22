import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches, IsOptional, IsBoolean, IsNumber } from 'class-validator';

@InputType()
export class CreateCenterInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  location: string;

  @Field()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'openingTime must be in HH:mm format' })
  openingTime: string;

  @Field()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'closingTime must be in HH:mm format' })
  closingTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasStayFacility?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  stayPricePerNight?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  stayAmenities?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  availableStayBeds?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  stayRules?: string;
}
