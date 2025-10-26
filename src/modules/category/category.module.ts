import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import {
  BrandModel,
  BrandRepository,
  CategoryModel,
  CategoryRepository,
} from 'src/DB';
import { S3Service } from 'src/commen/services/multer.service';

@Module({
  imports: [CategoryModel, BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService, BrandRepository, CategoryRepository, S3Service],
})
export class CategoryModule {}
