import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CentersService } from './centers.service';
import { Center } from './schemas/center.schema';
import { CreateCenterInput } from './dto/create-center.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/schemas/user.schema';

@Resolver(() => Center)
export class CentersResolver {
  constructor(private readonly centersService: CentersService) {}

  @Query(() => [Center], { name: 'centers' })
  async findAll(): Promise<Center[]> {
    return this.centersService.findAll();
  }

  @Mutation(() => Center)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCenter(@Args('createCenterInput') createCenterInput: CreateCenterInput): Promise<Center> {
    return this.centersService.create(createCenterInput);
  }
}
