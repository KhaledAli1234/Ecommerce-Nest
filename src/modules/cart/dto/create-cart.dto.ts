import { IsMongoId, IsNumber, IsPositive, Min } from 'class-validator';
import { Types } from 'mongoose';
import { ICartProduct, IProduct } from 'src/commen';

export class CreateCartDto implements Partial<ICartProduct> {
  @IsMongoId()
  productId: Types.ObjectId;
  @Min(1)
  @IsPositive()
  @IsNumber()
  quantity: number;
}
