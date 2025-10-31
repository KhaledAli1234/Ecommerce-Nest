import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { couponEnum, ICoupon } from 'src/commen';

export class CreateCouponDto implements Partial<ICoupon> {
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  descount: number;
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  duration: number;
  @IsDateString()
  endDate: Date;
  @IsDateString()
  startDate: Date;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsEnum(couponEnum)
  type: couponEnum;
}
