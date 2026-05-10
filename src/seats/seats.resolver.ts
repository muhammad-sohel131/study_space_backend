import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { Seat } from './schemas/seat.schema';
import { CreateSeatInput } from './dto/create-seat.input';
import { UpdateSeatInput } from './dto/update-seat.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/schemas/user.schema';
import { Booking } from '../bookings/schemas/booking.schema';
import { BookingsService } from '../bookings/bookings.service';

@Resolver(() => Seat)
export class SeatsResolver {
  constructor(
    private readonly seatsService: SeatsService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Query(() => [Seat], { name: 'seats' })
  async getSeatsByCenter(@Args('centerId') centerId: string): Promise<Seat[]> {
    return this.seatsService.findByCenter(centerId);
  }

  @Mutation(() => Seat)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createSeat(@Args('createSeatInput') createSeatInput: CreateSeatInput): Promise<Seat> {
    return this.seatsService.create(createSeatInput);
  }

  @Mutation(() => Seat, { nullable: true })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateSeat(@Args('updateSeatInput') updateSeatInput: UpdateSeatInput): Promise<Seat | null> {
    return this.seatsService.update(updateSeatInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteSeat(@Args('id') id: string): Promise<boolean> {
    return this.seatsService.remove(id);
  }

  @ResolveField(() => [Booking])
  async bookings(@Parent() seat: Seat): Promise<Booking[]> {
    return this.bookingsService.findBySeat(seat.id);
  }
}
