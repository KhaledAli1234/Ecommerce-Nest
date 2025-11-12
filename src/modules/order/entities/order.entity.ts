import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import {
  IOrder,
  IOrderProduct,
  IToken,
  type IUser,
  OrderStatusEnum,
  PaymentEnum,
} from 'src/commen';
import { OneUserResponse } from 'src/modules/user/entities';

export class OrderResponse {
  order: IOrder;
}

registerEnumType(PaymentEnum, {
  name: 'PaymentEnum',
});

registerEnumType(OrderStatusEnum, {
  name: 'OrderStatusEnum',
});

@ObjectType()
export class OneOrderProductResponse implements IOrderProduct {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  productId: Types.ObjectId;
  @Field(() => Number)
  quantity: number;
  @Field(() => Number)
  unitPrice: number;
  @Field(() => Number)
  finalPrice: number;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class OneOrderResponse implements IOrder {
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => String)
  orderId: string;

  @Field(() => String)
  address: string;
  @Field(() => String, { nullable: true })
  note?: string;
  @Field(() => String)
  phone: string;

  @Field(() => ID, { nullable: true })
  coupon?: Types.ObjectId;
  @Field(() => Number)
  subtotal: number;
  @Field(() => OrderStatusEnum)
  status: OrderStatusEnum;
  @Field(() => Number, { nullable: true })
  discount?: number;
  @Field(() => Number)
  total: number;

  @Field(() => String, { nullable: true })
  intentId?: string;
  @Field(() => Date, { nullable: true })
  paidAt?: Date;
  @Field(() => PaymentEnum)
  payment: PaymentEnum;

  @Field(() => [OneOrderProductResponse])
  products: IOrderProduct[];
  @Field(() => String, { nullable: true })
  patmentIntent?: string;
  @Field(() => String, { nullable: true })
  cancelReason?: string;

  @Field(() => OneUserResponse)
  createdBy: IUser;
  @Field(() => ID, { nullable: true })
  updatedBy?: Types.ObjectId;

  @Field(() => Date, { nullable: true })
  freezedAt?: Date;
  @Field(() => Date, { nullable: true })
  restoredAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class GetAllOrdersResponse {
  @Field(() => Number, { nullable: true })
  docCount?: number;
  @Field(() => Number, { nullable: true })
  limit?: number;
  @Field(() => Number, { nullable: true })
  pages?: number;
  @Field(() => Number, { nullable: true })
  currentPage?: number;
  @Field(() => [OneOrderResponse])
  result: IToken[];
}
