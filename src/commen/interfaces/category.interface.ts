import { Types } from 'mongoose';
import { IUser } from './user.interface';
import { IBrand } from './brand.interface';

export interface ICategory {
  _id?: Types.ObjectId;

  name: string;
  slug: string;
  description?: string;
  image: string;
  assetFolderId: string;

  brands?: Types.ObjectId[] | IBrand[];

  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;

  freezedAt?: Date;
  restoredAt?: Date;
}
