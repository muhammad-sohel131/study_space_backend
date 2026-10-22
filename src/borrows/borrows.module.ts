import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BorrowsService } from './borrows.service';
import { BorrowsResolver } from './borrows.resolver';
import { Borrow, BorrowSchema } from './schemas/borrow.schema';
import { Book, BookSchema } from '../books/schemas/book.schema';
import { Center, CenterSchema } from '../centers/schemas/center.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Borrow.name, schema: BorrowSchema },
      { name: Book.name, schema: BookSchema },
      { name: Center.name, schema: CenterSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [BorrowsService, BorrowsResolver],
  exports: [BorrowsService],
})
export class BorrowsModule {}
