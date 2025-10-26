import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel, BrandRepository } from 'src/DB';
import { S3Service } from 'src/commen/services/multer.service';

@Module({
  imports:[BrandModel],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository, S3Service],
})
export class BrandModule {}
