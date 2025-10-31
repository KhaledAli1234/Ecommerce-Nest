import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponModel, CouponRepository } from 'src/DB';
import { S3Service } from 'src/commen/services/multer.service';

@Module({
  imports: [CouponModel],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository, S3Service],
})
export class CouponModule {}
