import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IPaginatedType<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => [classRef])
    data: T[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    totalPages: number;
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}
