import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { ContainField } from 'src/commen';
import { Type } from 'class-transformer';

@ContainField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

export class BrandParamsDto {
  @IsMongoId()
  brandId: Types.ObjectId;
}

export class GetAllDto {
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  page: number;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  size: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  search: number;
}
