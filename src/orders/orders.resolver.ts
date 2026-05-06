import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { CreateOrderInput } from './dto/create-order.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  async buyBook(
    @CurrentUser() user: User,
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
  ): Promise<Order> {
    return this.ordersService.buyBook(user.id, createOrderInput);
  }

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  async borrowBook(
    @CurrentUser() user: User,
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
  ): Promise<Order> {
    return this.ordersService.borrowBook(user.id, createOrderInput);
  }

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  async returnBook(
    @CurrentUser() user: User,
    @Args('orderId') orderId: string,
  ): Promise<Order> {
    return this.ordersService.returnBook(user.id, orderId);
  }
}
