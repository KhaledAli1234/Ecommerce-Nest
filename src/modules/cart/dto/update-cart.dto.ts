import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Validate } from 'class-validator';
import { Types } from 'mongoose';
import { MongoDBIds } from 'src/commen';

export class UpdateCartDto extends PartialType(CreateCartDto) {}

export class RemoveItemsFromCartDto {
  @Validate(MongoDBIds)
  productId: Types.ObjectId[];
}
