import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsOptional, Validate } from 'class-validator';
import { Types } from 'mongoose';
import { ContainField, MongoDBIds } from 'src/commen';
import { CreateCategoryDto } from './create-category.dto';

@ContainField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Validate(MongoDBIds)
  @IsOptional()
  removeBrands: Types.ObjectId[] | undefined;
}

export class CategoryParamsDto {
  @IsMongoId()
  categoryId: Types.ObjectId;
}
