import { Resolver, Mutation, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BorrowsService } from './borrows.service';
import { Borrow } from './schemas/borrow.schema';
import { BorrowBookInput } from './dto/borrow-book.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '../auth/schemas/user.schema';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Book } from '../books/schemas/book.schema';
import { Center } from '../centers/schemas/center.schema';

@Resolver(() => Borrow)
export class BorrowsResolver {
  constructor(
    private readonly borrowsService: BorrowsService,
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
    @InjectModel(Center.name) private readonly centerModel: Model<Center>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

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

  @ResolveField(() => Book, { nullable: true })
  async book(@Parent() borrow: Borrow): Promise<Book | null> {
    if (borrow.book && (borrow.book as any).id) {
      return borrow.book;
    }
    const bookId = (borrow as any).bookId || (borrow.book as any)?._id || (borrow.book as any)?.id;
    if (!bookId) return null;
    const b = await this.bookModel.findById(bookId).populate('centerId').exec();
    if (!b) return null;
    const obj: any = b.toObject();
    obj.id = obj._id?.toString() || '';
    if (obj.centerId && typeof obj.centerId === 'object' && obj.centerId._id) {
      obj.center = {
        ...obj.centerId,
        id: obj.centerId._id.toString(),
      };
      obj.centerId = obj.center.id;
    }
    return obj as Book;
  }

  @ResolveField(() => Center, { nullable: true })
  async center(@Parent() borrow: Borrow): Promise<Center | null> {
    if (borrow.center && (borrow.center as any).id) {
      return borrow.center;
    }
    const centerId = (borrow as any).centerId || (borrow.center as any)?._id || (borrow.center as any)?.id;
    if (!centerId) return null;
    const c = await this.centerModel.findById(centerId).exec();
    if (!c) return null;
    const obj: any = c.toObject();
    obj.id = obj._id?.toString() || '';
    return obj as Center;
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() borrow: Borrow): Promise<User | null> {
    if (borrow.user && (borrow.user as any).id) {
      return borrow.user;
    }
    const userId = (borrow as any).userId || (borrow.user as any)?._id || (borrow.user as any)?.id;
    if (!userId) return null;
    const u = await this.userModel.findById(userId).exec();
    if (!u) return null;
    const obj: any = u.toObject();
    obj.id = obj._id?.toString() || '';
    return obj as User;
  }
}
