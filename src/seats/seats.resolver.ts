import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { Seat } from './schemas/seat.schema';
import { CreateSeatInput } from './dto/create-seat.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/schemas/user.schema';

@Resolver(() => Seat)
export class SeatsResolver {
  constructor(private readonly seatsService: SeatsService) {}

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
}
