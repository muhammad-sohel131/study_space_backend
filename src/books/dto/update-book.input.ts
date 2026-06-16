import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateBookInput } from './create-book.input';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateBookInput extends PartialType(CreateBookInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}
