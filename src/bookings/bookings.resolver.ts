import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './schemas/booking.schema';
import { CreateBookingInput } from './dto/create-booking.input';
import { Seat } from '../seats/schemas/seat.schema';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';

@Resolver(() => Booking)
export class BookingsResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @Mutation(() => Booking)
  @UseGuards(GqlAuthGuard)
  async createBooking(
    @CurrentUser() user: User,
    @Args('createBookingInput') createBookingInput: CreateBookingInput,
  ): Promise<Booking> {
    return this.bookingsService.create(user.id, createBookingInput);
  }

  @Query(() => [Booking], { name: 'myBookings' })
  @UseGuards(GqlAuthGuard)
  async getMyBookings(@CurrentUser() user: User): Promise<Booking[]> {
    return this.bookingsService.getMyBookings(user.id);
  }

  @Mutation(() => Booking)
  @UseGuards(GqlAuthGuard)
  async cancelBooking(
    @CurrentUser() user: User,
    @Args('bookingId') bookingId: string,
  ): Promise<Booking> {
    return this.bookingsService.cancelBooking(user.id, bookingId);
  }

  @Query(() => [Seat], { name: 'availableSeats' })
  async getAvailableSeats(
    @Args('centerId') centerId: string,
    @Args('startTime') startTime: string,
    @Args('endTime') endTime: string,
  ): Promise<Seat[]> {
    return this.bookingsService.getAvailableSeats(centerId, startTime, endTime);
  }
}
