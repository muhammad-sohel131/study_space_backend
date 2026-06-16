import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsMongoId, IsNumber, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class OrderItemInput {
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

@InputType()
export class CreateOrderInput {
  @Field(() => [OrderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];
}
