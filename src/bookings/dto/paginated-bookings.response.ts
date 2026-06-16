import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/dto/paginated';
import { Booking } from '../schemas/booking.schema';

@ObjectType()
export class PaginatedBookings extends Paginated(Booking) {}
