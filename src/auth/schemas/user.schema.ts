import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Document } from 'mongoose';

export enum Role {
  STUDENT = 'student',
  ADMIN = 'admin',
}

registerEnumType(Role, {
  name: 'Role',
});

@ObjectType()
@Schema({ timestamps: true })
export class User extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string; // not exposed in GraphQL

  @Field(() => Role)
  @Prop({ required: true, enum: Role, default: Role.STUDENT })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
