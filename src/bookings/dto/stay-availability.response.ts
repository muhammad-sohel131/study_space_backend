import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BedUnitStatus {
  @Field(() => String)
  unitNumber: string;

  @Field(() => Boolean)
  isBooked: boolean;
}

@ObjectType()
export class RoomTypeAvailability {
  @Field(() => String)
  roomType: string;

  @Field(() => Int)
  totalBeds: number;

  @Field(() => Int)
  bookedBeds: number;

  @Field(() => Int)
  emptyBeds: number;

  @Field(() => Boolean)
  isAvailable: boolean;

  @Field(() => [BedUnitStatus])
  bedUnits: BedUnitStatus[];
}

@ObjectType()
export class StayAvailability {
  @Field(() => Int)
  totalBeds: number;

  @Field(() => Int)
  bookedBeds: number;

  @Field(() => Int)
  availableBeds: number;

  @Field(() => Boolean)
  isAvailable: boolean;

  @Field(() => String, { nullable: true })
  statusNote?: string;

  @Field(() => [RoomTypeAvailability])
  roomTypeBreakdown: RoomTypeAvailability[];
}
