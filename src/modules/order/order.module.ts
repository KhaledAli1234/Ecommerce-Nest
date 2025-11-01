import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import {
  CartModel,
  CartRepository,
  CouponModel,
  CouponRepository,
  OrderModel,
  OrderRepository,
  ProductModel,
  ProductRepository,
} from 'src/DB';
import { CartService } from '../cart/cart.service';
import { PaymentService } from 'src/commen';

@Module({
  imports: [OrderModel, CartModel, ProductModel, CouponModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    ProductRepository,
    CartRepository,
    CouponRepository,
    CartService,
    PaymentService,
  ],
})
export class OrderModule {}
