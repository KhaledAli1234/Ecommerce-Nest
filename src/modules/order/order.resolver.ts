import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { GetAllOrdersResponse } from './entities/order.entity';
import { Auth, GetAllGraphDto, RoleEnum, User } from 'src/commen';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { type UserDocument } from 'src/DB';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Auth([RoleEnum.admin])
  @Query(() => GetAllOrdersResponse, {
    name: 'allOrders',
    description: 'retrieve all Orders',
  })
  async allOrders(
    @User() user: UserDocument,
    @Args('data', { nullable: true }) getAllGraphDto?: GetAllGraphDto,
  ) {
    const result = await this.orderService.findAll(getAllGraphDto, false);
    console.log({ result });
    return result;
  }

  @Query(() => String, {
    name: 'welcome',
    description: 'first welcome point🍀',
  })
  sayHi(): string {
    return 'Hello graphQL with NEST JS';
  }

  @Mutation(() => String, {
    name: 'welcome',
    description: 'first welcome point🍀',
  })
  updateOrder(): string {
    return 'order';
  }
}
