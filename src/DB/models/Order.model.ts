import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IOrder, IOrderProduct, IProduct } from 'src/commen';
import { OrderStatusEnum, PaymentEnum } from 'src/commen/enums/order.enum';

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class OrderProduct implements IOrderProduct {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Types.ObjectId | IProduct;
  @Prop({
    type: Number,
    required: true,
  })
  quantity: number;
  @Prop({
    type: Number,
    required: true,
  })
  unitPrice: number;
}

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order implements IOrder {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  orderId: string;

  @Prop({
    type: String,
    required: true,
  })
  address: string;

  @Prop({
    type: String,
    required: true,
  })
  phone: string;

  @Prop({
    type: String,
  })
  note?: string;

  @Prop({
    type: String,
  })
  cancelReason?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Coupon',
  })
  coupon?: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
  })
  discount?: number;

  @Prop({
    type: Date,
  })
  paidAt?: Date;

  @Prop({
    type: String,
    enum: PaymentEnum,
    default: PaymentEnum.Cash,
  })
  payment: PaymentEnum;

  @Prop({
    type: String,
  })
  patmentIntent?: string;

  @Prop([OrderProduct])
  products: IOrderProduct[];

  @Prop({
    type: String,
    enum: OrderStatusEnum,
    default: function (this: Order) {
      return this.payment == PaymentEnum.Card
        ? OrderStatusEnum.Pending
        : OrderStatusEnum.Placed;
    },
  })
  status: OrderStatusEnum;
  @Prop({
    type: Number,
  })
  subtotal: number;
  @Prop({
    type: Number,
    required: true,
  })
  total: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  updatedBy?: Types.ObjectId;

  @Prop({
    type: Date,
  })
  freezedAt?: Date;

  @Prop({
    type: Date,
  })
  restoredAt?: Date;
}

const orderSchema = SchemaFactory.createForClass(Order);

orderSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});
orderSchema.pre(['findOne', 'find'], async function (next) {
  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});

export type OrderDocument = HydratedDocument<Order>;
export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: orderSchema },
]);
