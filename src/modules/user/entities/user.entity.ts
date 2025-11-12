import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import {
  GenderEnum,
  IProduct,
  IUser,
  LanguageEnum,
  providerEnum,
  RoleEnum,
} from 'src/commen';
import { Otp } from 'src/DB';

export class profileResponse {
  profile: IUser;
}

registerEnumType(providerEnum, {
  name: 'providerEnum',
});

registerEnumType(LanguageEnum, {
  name: 'LanguageEnum',
});

registerEnumType(GenderEnum, {
  name: 'GenderEnum',
});

registerEnumType(RoleEnum, {
  name: 'RoleEnum',
});

@ObjectType()
export class OneUserResponse implements IUser {
  @Field(() => ID)
  _id?: Types.ObjectId;
  @Field(() => Date, { nullable: true })
  changeCredentialsTime?: Date;
  @Field(() => Date, { nullable: true })
  confirmedAt?: Date;
  @Field(() => String)
  email: string;
  @Field(() => String)
  firstName: string;
  @Field(() => GenderEnum)
  gender: GenderEnum;
  @Field(() => String)
  lastName: string;
  // @Field(() => Date)
  // otp?: (Document<unknown, {}, Otp, {}, {}> &
  //   Otp & { _id: Types.ObjectId } & { __v: number })[];
  @Field(() => String, { nullable: true })
  password?: string;
  @Field(() => LanguageEnum)
  preferredLanguage: LanguageEnum;
  @Field(() => String, { nullable: true })
  profileImage?: string;
  @Field(() => String, { nullable: true })
  profilePicture?: string;
  @Field(() => providerEnum)
  provider: providerEnum;
  @Field(() => RoleEnum)
  role: RoleEnum;
  @Field(() => String, { nullable: true })
  username?: string;
  @Field(() => [ID], { nullable: true })
  wishlist?: Types.ObjectId[];

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
