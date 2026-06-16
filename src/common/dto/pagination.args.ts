import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  limit: number = 10;
}
