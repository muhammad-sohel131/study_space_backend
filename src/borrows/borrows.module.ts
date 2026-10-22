import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BorrowsService } from './borrows.service';
import { BorrowsResolver } from './borrows.resolver';
import { Borrow, BorrowSchema } from './schemas/borrow.schema';
import { Book, BookSchema } from '../books/schemas/book.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Borrow.name, schema: BorrowSchema },
      { name: Book.name, schema: BookSchema },
    ]),
  ],
  providers: [BorrowsService, BorrowsResolver],
  exports: [BorrowsService],
})
export class BorrowsModule {}
