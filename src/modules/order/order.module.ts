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
import { RealTimeGateway } from '../gateway/gateway';
import { OrderResolver } from './order.resolver';

@Module({
  imports: [OrderModel, CartModel, ProductModel, CouponModel],
  controllers: [OrderController],
  providers: [
    RealTimeGateway,
    OrderService,
    OrderRepository,
    ProductRepository,
    CartRepository,
    CouponRepository,
    CartService,
    PaymentService,
    OrderResolver,
  ],
})
export class OrderModule {}
