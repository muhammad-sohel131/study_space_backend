import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class InitPaymentResponse {
  @Field()
  paymentUrl: string;
}
