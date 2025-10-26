import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';
import { IProduct } from 'src/commen';

export class CreateProductDto implements Partial<IProduct> {
  @IsMongoId()
  brand: Types.ObjectId;
  @IsMongoId()
  category: Types.ObjectId;
  @Length(2, 50000)
  @IsString()
  @IsOptional()
  description?: string;
  @Length(2, 2000)
  @IsString()
  @IsOptional()
  name: string;
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  originalPrice: number;
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  discountPercent: number;
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  stock: number;
}
