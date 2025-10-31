import { Types } from 'mongoose';
import { IUser } from './user.interface';
import { ICategory } from './category.interface';
import { IBrand } from './brand.interface';

export interface IProduct {
  _id?: Types.ObjectId;

  name: string;
  slug: string;
  description?: string;
  images: string[];

  mainPrice: number;
  discountPercent: number;
  salePrice: number;

  stock: number;
  soldItems: number;
  assetFolderId: string;


  category: Types.ObjectId | ICategory;
  brand: Types.ObjectId | IBrand;

  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;

  freezedAt?: Date;
  restoredAt?: Date;
}
