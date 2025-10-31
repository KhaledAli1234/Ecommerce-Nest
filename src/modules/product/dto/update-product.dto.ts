import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { ContainField } from 'src/commen';
import { CreateProductDto } from './create-product.dto';

@ContainField()
export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class UpdateProductAttachmentsDto {
  @IsArray()
  @IsOptional()
  removedAttachments?: string[];
}

export class ProductParamsDto {
  @IsMongoId()
  productId: Types.ObjectId;
}
