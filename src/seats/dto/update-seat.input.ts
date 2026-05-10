import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateSeatInput } from './create-seat.input';
import { IsNotEmpty, IsMongoId } from 'class-validator';

@InputType()
export class UpdateSeatInput extends PartialType(CreateSeatInput) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
