import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCenterInput } from './create-center.input';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateCenterInput extends PartialType(CreateCenterInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}
