import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CentersService } from './centers.service';
import { Center } from './schemas/center.schema';
import { CreateCenterInput } from './dto/create-center.input';
import { UpdateCenterInput } from './dto/update-center.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/schemas/user.schema';
import { PaginationArgs } from '../common/dto/pagination.args';
import { PaginatedCenters } from './dto/paginated-centers.response';

@Resolver(() => Center)
export class CentersResolver {
  constructor(private readonly centersService: CentersService) {}

  @Query(() => PaginatedCenters, { name: 'centers' })
  async findAll(@Args() paginationArgs: PaginationArgs): Promise<PaginatedCenters> {
    return this.centersService.findAll(paginationArgs);
  }

  @Query(() => Center, { name: 'center' })
  async findOne(@Args('id') id: string): Promise<Center | null> {
    return this.centersService.findOne(id);
  }

  @Mutation(() => Center)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCenter(@Args('createCenterInput') createCenterInput: CreateCenterInput): Promise<Center> {
    return this.centersService.create(createCenterInput);
  }

  @Mutation(() => Center, { nullable: true })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCenter(@Args('updateCenterInput') updateCenterInput: UpdateCenterInput): Promise<Center | null> {
    return this.centersService.update(updateCenterInput.id, updateCenterInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCenter(@Args('id') id: string): Promise<boolean> {
    return this.centersService.remove(id);
  }
}
