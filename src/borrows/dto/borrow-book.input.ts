import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsMongoId, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

@InputType()
export class BorrowBookInput {
  @Field()
  @IsNotEmpty()
  @IsMongoId()
  bookId: string;

  @Field(() => Int, { defaultValue: 7 })
  @IsNumber()
  @Min(1)
  @Max(30)
  durationDays: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
