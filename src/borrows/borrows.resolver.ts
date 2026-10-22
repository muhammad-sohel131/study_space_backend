import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BorrowsService } from './borrows.service';
import { Borrow } from './schemas/borrow.schema';
import { BorrowBookInput } from './dto/borrow-book.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '../auth/schemas/user.schema';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver(() => Borrow)
export class BorrowsResolver {
  constructor(private readonly borrowsService: BorrowsService) {}

  @Mutation(() => Borrow)
  @UseGuards(GqlAuthGuard)
  async borrowBook(
    @CurrentUser() user: User,
    @Args('borrowBookInput') input: BorrowBookInput,
  ): Promise<Borrow> {
    return this.borrowsService.borrowBook(user.id, input);
  }

  @Mutation(() => Borrow)
  @UseGuards(GqlAuthGuard)
  async returnBook(
    @CurrentUser() user: User,
    @Args('borrowId') borrowId: string,
  ): Promise<Borrow> {
    const isAdmin = user.role === Role.ADMIN;
    return this.borrowsService.returnBook(user.id, borrowId, isAdmin);
  }

  @Query(() => [Borrow], { name: 'myBorrows' })
  @UseGuards(GqlAuthGuard)
  async myBorrows(@CurrentUser() user: User): Promise<Borrow[]> {
    return this.borrowsService.myBorrows(user.id);
  }

  @Query(() => [Borrow], { name: 'allBorrows' })
  @Roles(Role.ADMIN)
  @UseGuards(GqlAuthGuard, RolesGuard)
  async allBorrows(): Promise<Borrow[]> {
    return this.borrowsService.allBorrows();
  }
}
