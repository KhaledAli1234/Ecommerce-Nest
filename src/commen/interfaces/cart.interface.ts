import { Types } from 'mongoose';
import { IUser } from './user.interface';
import { IProduct } from './product.interface';

export interface ICartProduct {
  _id?: Types.ObjectId;

  productId: Types.ObjectId | IProduct;
  quantity: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICart {
  _id?: Types.ObjectId;

  createdBy: Types.ObjectId | IUser;
  products: ICartProduct[];

  createdAt?: Date;
  updatedAt?: Date;
}
