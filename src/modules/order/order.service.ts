import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  CartRepository,
  CouponRepository,
  OrderDocument,
  OrderProduct,
  OrderRepository,
  ProductDocument,
  ProductRepository,
  UserDocument,
} from 'src/DB';
import {
  couponEnum,
  OrderStatusEnum,
  PaymentEnum,
  PaymentService,
} from 'src/commen';
import { randomUUID } from 'crypto';
import { CartService } from '../cart/cart.service';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import { Request } from 'express';
import { RealTimeGateway } from '../gateway/gateway';

@Injectable()
export class OrderService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
    private readonly cartService: CartService,
    private readonly paymentService: PaymentService,
    private readonly realTimeGateway: RealTimeGateway,
  ) {}

  async webhook(req: Request) {
    const event = await this.paymentService.webhook(req);
    const { orderId } = event.data.object.metadata as { orderId: string };
    const order = await this.orderRepository.findOneAndUpdate({
      filter: {
        _id: Types.ObjectId.createFromHexString(orderId),
        status: OrderStatusEnum.Pending,
        payment: PaymentEnum.Card,
      },
      update: {
        paidAt: new Date(),
        status: OrderStatusEnum.Placed,
      },
    });
    if (!order) {
      throw new NotFoundException('fail to find matching order');
    }
    await this.paymentService.confirmPaymentIntent(order.intentId);
  }

  async create(
    createOrderDto: CreateOrderDto,
    user: UserDocument,
  ): Promise<OrderDocument> {
    const cart = await this.cartRepository.findOne({
      filter: { createdBy: user._id },
    });
    if (!cart?.products?.length) {
      throw new NotFoundException('Cart is empty');
    }
    let discount = 0;
    let coupon: any;
    if (createOrderDto.coupon) {
      coupon = await this.couponRepository.findOne({
        filter: {
          _id: createOrderDto.coupon,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        },
      });
      if (!coupon) {
        throw new NotFoundException('fail to find matching coupon');
      }
      if (
        coupon.duration <=
        coupon.userBy.filter((ele) => {
          return ele.toString() == user._id.toString();
        }).length
      ) {
        throw new ConflictException(`can be used only ${coupon.duration}`);
      }
    }
    let total = 0;
    const products: OrderProduct[] = [];
    for (const product of cart.products) {
      const cartProduct = await this.productRepository.findOne({
        filter: {
          _id: product.productId,
          stock: { $gte: product.quantity },
        },
      });
      if (!cartProduct) {
        throw new NotFoundException(
          `fail to find matching product ${product.productId} or out of stock`,
        );
      }
      const finalPrice = cartProduct.salePrice * product.quantity;
      products.push({
        productId: cartProduct._id,
        unitPrice: cartProduct.salePrice,
        quantity: product.quantity,
        finalPrice,
      });
      total += finalPrice;
    }
    if (coupon) {
      discount =
        coupon.type == couponEnum.Percent
          ? coupon.discount / 100
          : coupon.discount / total;
    }
    delete createOrderDto.coupon;
    const [order] = await this.orderRepository.create({
      data: [
        {
          ...createOrderDto,
          coupon: coupon?._id,
          discount,
          orderId: randomUUID().slice(0, 8),
          products,
          total,
          createdBy: user._id,
        },
      ],
    });
    if (!order) {
      throw new BadRequestException('fail to create this order');
    }
    if (coupon) {
      coupon.usedBy.push(user._id);
      await coupon.save();
    }
    const stockProducts: { productId: Types.ObjectId; stock: number }[] = [];
    for (const product of cart.products) {
      const updatedProduct = (await this.productRepository.findOneAndUpdate({
        filter: {
          _id: product.productId,
          stock: { $gte: product.quantity },
        },
        update: {
          $inc: { __v: 1, stock: -product.quantity },
        },
      })) as ProductDocument;
      stockProducts.push({
        productId: updatedProduct._id,
        stock: updatedProduct?.stock,
      });
    }
    this.realTimeGateway.changeProductStock(stockProducts)
    await this.cartService.remove(user);
    return order;
  }

  async cancel(
    orderId: Types.ObjectId,
    user: UserDocument,
  ): Promise<OrderDocument> {
    const order = await this.orderRepository.findOneAndUpdate({
      filter: {
        _id: orderId,
        status: { $lt: OrderStatusEnum.Cancel },
      },
      update: {
        status: OrderStatusEnum.Cancel,
        updatedBy: user._id,
      },
    });
    if (!order) {
      throw new NotFoundException('fail to find matching order');
    }
    for (const product of order.products) {
      await this.productRepository.updateOne({
        filter: {
          _id: product.productId,
        },
        update: { $inc: { stock: product.quantity, __v: 1 } },
      });
    }
    if (order.coupon) {
      await this.couponRepository.updateOne({
        filter: { _id: order.coupon },
        update: {
          $pull: { usedBy: order.createdBy },
        },
      });
    }
    if (order.payment == PaymentEnum.Card) {
      await this.paymentService.refund(order.intentId);
    }

    return order as OrderDocument;
  }

  async checkout(orderId: Types.ObjectId, user: UserDocument) {
    const order = await this.orderRepository.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        payment: PaymentEnum.Card,
        status: OrderStatusEnum.Pending,
      },
      options: {
        populate: [{ path: 'products.productId', select: 'name' }],
      },
    });
    if (!order) {
      throw new NotFoundException('fail to find matching order');
    }
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.discount) {
      const coupon = await this.paymentService.createCoupon({
        duration: 'once',
        currency: 'egp',
        percent_off: order.discount * 100,
      });
      discounts.push({ coupon: coupon.id });
    }
    const session = await this.paymentService.checkoutSession({
      customer_email: user.email,
      metadata: { orderId: orderId.toString() },
      discounts,
      line_items: order.products.map((product) => {
        return {
          quantity: product.quantity,
          price_data: {
            currency: 'egp',
            product_data: {
              name: (product.productId as ProductDocument).name,
            },
            unit_amount: product.unitPrice * 100,
          },
        };
      }),
    });

    const method = await this.paymentService.createPaymentMethod({
      type: 'card',
      card: {
        token: 'tok_visa',
      },
    });
    const intent = await this.paymentService.createPaymentIntent({
      amount: order.subtotal * 100,
      currency: 'egp',
      payment_method: method.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
    order.intentId = intent.id;
    await order.save();

    return session.url;
  }
}
