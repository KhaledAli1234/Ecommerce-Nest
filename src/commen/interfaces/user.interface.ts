import { OtpDocument } from 'src/DB';
import { GenderEnum, LanguageEnum, providerEnum, RoleEnum } from '../enums';
import { Types } from 'mongoose';
import { IProduct } from './product.interface';

export interface IUser {
  _id?: Types.ObjectId;

  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  confirmedAt?: Date;
  password?: string;
  profileImage?: string;
  profilePicture?: string;
  provider: providerEnum;
  gender: GenderEnum;
  role: RoleEnum;
  preferredLanguage: LanguageEnum;
  changeCredentialsTime?: Date;
  otp?: OtpDocument[];

  wishlist?: Types.ObjectId[] | IProduct[];


  createdAt?: Date;
  updatedAt?: Date;
}
