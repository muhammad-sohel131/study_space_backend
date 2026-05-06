import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './schemas/book.schema';
import { CreateBookInput } from './dto/create-book.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/schemas/user.schema';

@Resolver(() => Book)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @Query(() => [Book], { name: 'books' })
  async getBooks(@Args('centerId', { nullable: true }) centerId?: string): Promise<Book[]> {
    if (centerId) {
      return this.booksService.findByCenter(centerId);
    }
    return this.booksService.findAll();
  }

  @Mutation(() => Book)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createBook(@Args('createBookInput') createBookInput: CreateBookInput): Promise<Book> {
    return this.booksService.create(createBookInput);
  }
}
