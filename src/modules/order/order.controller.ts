import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderParamDto } from './dto/create-order.dto';
import { Auth, IResponse, RoleEnum, successResponse, User } from 'src/commen';
import { endPoint } from './order.authorization.module';
import type { UserDocument } from 'src/DB';
import { OrderResponse } from './entities/order.entity';
import type { Request } from 'express';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth(endPoint.create)
  @Post()
  async create(
    @User() user: UserDocument,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(createOrderDto, user);
    return successResponse<OrderResponse>({ status: 201, data: { order } });
  }

  @Auth([RoleEnum.superAdmin, RoleEnum.admin])
  @Patch(':orderId')
  async cancel(
    @User() user: UserDocument,
    @Param() params: OrderParamDto,
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.cancel(params.orderId, user);
    return successResponse<OrderResponse>({ data: { order } });
  }

  @Post('webhook')
  async webhook(@Req() req: Request): Promise<IResponse> {
    await this.orderService.webhook(req);
    return successResponse();
  }

  @Auth(endPoint.create)
  @Post(':orderId')
  async checkout(
    @User() user: UserDocument,
    @Param() params: OrderParamDto,
  ): Promise<IResponse> {
    const session = await this.orderService.checkout(params.orderId, user);
    return successResponse({ status: 201, data: { session } });
  }
}
