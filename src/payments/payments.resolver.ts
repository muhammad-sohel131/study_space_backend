import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitPaymentResponse } from './dto/init-payment.response';
import { Payment } from './schemas/payment.schema';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => InitPaymentResponse)
  @UseGuards(GqlAuthGuard)
  async initPayment(
    @CurrentUser() user: User,
    @Args('bookingId') bookingId: string,
  ): Promise<InitPaymentResponse> {
    return this.paymentsService.initPayment(user.id, bookingId);
  }

  @Query(() => [Payment], { name: 'allPayments' })
  @UseGuards(GqlAuthGuard)
  async getAllPayments(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }
}
