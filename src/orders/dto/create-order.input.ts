import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsMongoId, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field()
  @IsNotEmpty()
  @IsMongoId()
  bookId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
