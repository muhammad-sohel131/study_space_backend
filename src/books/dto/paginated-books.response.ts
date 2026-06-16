import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/dto/paginated';
import { Book } from '../schemas/book.schema';

@ObjectType()
export class PaginatedBooks extends Paginated(Book) {}
