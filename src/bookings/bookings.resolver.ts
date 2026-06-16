import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingsService } from './bookings.service';
import { Booking } from './schemas/booking.schema';
import { CreateBookingInput } from './dto/create-booking.input';
import { Seat } from '../seats/schemas/seat.schema';
import { Center } from '../centers/schemas/center.schema';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { SeatsService } from '../seats/seats.service';
import { CentersService } from '../centers/centers.service';
import { PaginationArgs } from '../common/dto/pagination.args';
import { PaginatedBookings } from './dto/paginated-bookings.response';

@Resolver(() => Booking)
export class BookingsResolver {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly seatsService: SeatsService,
    private readonly centersService: CentersService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Mutation(() => Booking)
  @UseGuards(GqlAuthGuard)
  async createBooking(
    @CurrentUser() user: User,
    @Args('createBookingInput') createBookingInput: CreateBookingInput,
  ): Promise<Booking> {
    return this.bookingsService.create(user.id, createBookingInput);
  }

  @Query(() => PaginatedBookings, { name: 'myBookings' })
  @UseGuards(GqlAuthGuard)
  async getMyBookings(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs
  ): Promise<PaginatedBookings> {
    return this.bookingsService.getMyBookings(user.id, paginationArgs);
  }

  @Query(() => PaginatedBookings, { name: 'allBookings' })
  @UseGuards(GqlAuthGuard)
  async getAllBookings(@Args() paginationArgs: PaginationArgs): Promise<PaginatedBookings> {
    return this.bookingsService.findAll(paginationArgs);
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

  @ResolveField(() => Seat)
  async seat(@Parent() booking: Booking): Promise<Seat | null> {
    return this.seatsService.findById(booking.seatId);
  }

  @ResolveField(() => Center)
  async center(@Parent() booking: Booking): Promise<Center | null> {
    return this.centersService.findOne(booking.centerId);
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() booking: Booking): Promise<User | null> {
    return this.userModel.findById(booking.userId);
  }
}
