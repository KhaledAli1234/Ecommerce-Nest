import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import {
  CartModel,
  CartRepository,
  ProductModel,
  ProductRepository,
} from 'src/DB';

@Module({
  imports: [CartModel, ProductModel],
  controllers: [CartController],
  providers: [CartService, CartRepository, ProductRepository],
})
export class CartModule {}
