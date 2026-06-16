import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/dto/paginated';
import { Center } from '../schemas/center.schema';

@ObjectType()
export class PaginatedCenters extends Paginated(Center) {}
