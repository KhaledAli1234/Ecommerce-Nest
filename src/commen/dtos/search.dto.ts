import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

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
  search: string;
}

@InputType()
export class GetAllGraphDto {
  @Field(() => Number, { nullable: true })
  @IsPositive()
  @IsInt()
  @IsNumber()
  @IsOptional()
  page?: number;

  @Field(() => Number, { nullable: true })
  @IsPositive()
  @IsNumber()
  @IsOptional()
  size?: number;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  search?: string;
}
