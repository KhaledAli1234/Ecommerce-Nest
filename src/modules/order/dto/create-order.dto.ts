import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Types } from 'mongoose';
import { IOrder, PaymentEnum } from 'src/commen';

export class OrderParamDto {
  @IsMongoId()
  orderId: Types.ObjectId;
}

export class CreateOrderDto implements Partial<IOrder> {
  @IsMongoId()
  @IsOptional()
  coupon?: Types.ObjectId;
  @IsNotEmpty()
  @IsString()
  address: string;
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  note?: string;
  @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
  phone: string;
  @IsEnum(PaymentEnum)
  payment: PaymentEnum;
}
