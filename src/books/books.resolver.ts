import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './schemas/book.schema';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/schemas/user.schema';
import { PaginationArgs } from '../common/dto/pagination.args';
import { PaginatedBooks } from './dto/paginated-books.response';

@Resolver(() => Book)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @Query(() => PaginatedBooks, { name: 'books' })
  async getBooks(
    @Args() paginationArgs: PaginationArgs,
    @Args('centerId', { nullable: true }) centerId?: string
  ): Promise<PaginatedBooks> {
    return this.booksService.getBooks(paginationArgs, centerId);
  }

  @Mutation(() => Book)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createBook(@Args('createBookInput') createBookInput: CreateBookInput): Promise<Book> {
    return this.booksService.create(createBookInput);
  }

  @Mutation(() => Book)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateBook(@Args('updateBookInput') updateBookInput: UpdateBookInput): Promise<Book> {
    console.log("Received updateBookInput:", updateBookInput);
    return this.booksService.update(updateBookInput.id, updateBookInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteBook(@Args('id') id: string): Promise<boolean> {
    return this.booksService.remove(id);
  }
}
