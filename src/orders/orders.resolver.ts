import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
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

  @Query(() => [Order], { name: 'myOrders' })
  @UseGuards(GqlAuthGuard)
  async myOrders(@CurrentUser() user: User): Promise<Order[]> {
    return this.ordersService.myOrders(user.id);
  }
}
