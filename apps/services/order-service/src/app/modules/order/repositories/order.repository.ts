import { OrderStatusValues } from '@common/constants/order.constant';
import { PaymentStatusValues } from '@common/constants/payment.constant';
import {
  CreateOrderRepository,
  GetManyOrdersRequest,
  GetOrderRequest,
  UpdateStatusOrderRequest,
} from '@common/interfaces/models/order';
import { generateCode } from '@common/utils/order-code.util';
import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma-client/order-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyOrdersRequest) {
    const page = Number(data?.page) > 0 ? Number(data.page) : 1;
    const limit = Number(data?.limit) > 0 ? Number(data.limit) : 10;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      paymentId: data.paymentId || undefined,
      status: data.status || undefined,
      userId: data.userId || undefined,
      shopId: data.shopId || undefined,
    };

    const [orders, totalItems] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: {
            select: {
              productName: true,
              productImage: true,
            },
            take: 1,
          },
        },
      }),
      this.prismaService.order.count({ where }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      orders: orders.map((order) => ({
        id: order.id,
        code: order.code,
        shopId: order.shopId,
        shopName: '',
        status: order.status,
        itemTotal: order.itemTotal,
        grandTotal: order.grandTotal,
        firstProductImage: order.items[0]?.productImage || '',
        firstProductName: order.items[0]?.productName || '',
        createdAt: order.createdAt,
      })),
    };
  }

  async findById(data: GetOrderRequest) {
    const order = await this.prismaService.order.findFirst({
      where: {
        id: data.orderId,
        userId: data.userId || undefined,
        shopId: data.shopId || undefined,
        deletedAt: null,
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productImage: true,
            productName: true,
            skuValue: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    const receiverRaw = (order.receiver || {}) as {
      name?: string;
      phone?: string;
      address?: string;
    };

    const receiver = {
      name: receiverRaw.name || '',
      phone: receiverRaw.phone || '',
      address: receiverRaw.address || '',
    };

    return {
      id: order.id,
      code: order.code,
      userId: order.userId,
      shopId: order.shopId,
      shopName: '',
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      itemTotal: order.itemTotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      grandTotal: order.grandTotal,
      receiver,
      receiverName: receiver.name,
      receiverPhone: receiver.phone,
      receiverAddress: receiver.address,
      timeline: Array.isArray(order.timeline) ? order.timeline : [],
      itemsSnapshot: order.items,
      firstProductName: order.items[0]?.productName || '',
      firstProductImage: order.items[0]?.productImage || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async create(data: CreateOrderRepository) {
    const orders = await this.prismaService.$transaction(async (tx) => {
      return Promise.all(
        data.orders.map((shopOrder) => {
          const itemTotal =
            shopOrder.itemTotal ||
            shopOrder.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            );
          const discount = shopOrder.discount || 0;

          return tx.order.create({
            data: {
              code: generateCode('ORDER'),
              userId: data.userId,
              shopId: shopOrder.shopId,
              status: OrderStatus.PENDING,

              itemTotal: itemTotal,

              shippingFee: data.shippingFee,

              discount: discount,

              grandTotal: itemTotal + data.shippingFee + discount,

              receiver: data.receiver,
              paymentMethod: data.paymentMethod,
              paymentId: data.paymentId,
              paymentStatus: PaymentStatusValues.PENDING,
              timeline: [{ status: OrderStatus.PENDING, at: new Date() }],
              createdById: data.userId,

              items: {
                create: shopOrder.items.map((item) => ({
                  shopId: item.shopId,
                  productId: item.productId,
                  skuId: item.skuId,
                  productName: item.productName,
                  skuValue: item.skuValue,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.price * item.quantity,
                  productImage: item.productImage,
                })),
              },
            },
            include: {
              items: true,
            },
          });
        }),
      );
    });
    return orders;
  }

  async cancel(orderIds: string[], userId?: string, shopId?: string) {
    const orders = await this.prismaService.$transaction(async (tx) => {
      const existingOrders = await tx.order.findMany({
        where: {
          id: { in: orderIds },
          userId: userId ? userId : undefined,
          shopId: shopId ? shopId : undefined,
          status: {
            in: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
          },
          deletedAt: null,
        },
      });

      if (existingOrders.length === 0) {
        throw new Error('No valid orders found to cancel');
      }

      const updatedOrders = await Promise.all(
        existingOrders.map((order) =>
          tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.CANCELLED,
              timeline: [
                ...(Array.isArray(order.timeline) ? order.timeline : []),
                { status: OrderStatus.CANCELLED, at: new Date() },
              ],
              updatedById: userId,
            },
            include: {
              items: true,
            },
          }),
        ),
      );

      return updatedOrders;
    });

    return orders;
  }

  async listCancel(data: { paymentId?: string }) {
    return this.prismaService.order.findMany({
      where: {
        paymentId: data.paymentId ? data.paymentId : undefined,
      },
      select: {
        id: true,
        userId: true,
      },
    });
  }

  async paid(data: { paymentId: string }) {
    const orders = await this.prismaService.order.findMany({
      where: {
        paymentId: data.paymentId,
      },
    });

    return this.prismaService.$transaction(
      orders.map((order) =>
        this.prismaService.order.update({
          where: { id: order.id },
          data: {
            timeline: [
              ...(Array.isArray(order.timeline) ? order.timeline : []),
              { status: OrderStatusValues.PENDING, at: new Date() },
            ],
            paymentStatus: PaymentStatusValues.SUCCESS,
          },
        }),
      ),
    );
  }

  async updateStatus(data: UpdateStatusOrderRequest) {
    const order = await this.prismaService.order.findUnique({
      where: { id: data.id },
      select: { timeline: true },
    });

    return this.prismaService.order.update({
      where: { id: data.id, shopId: data.shopId },
      data: {
        status: data.status,
        timeline: [
          ...(Array.isArray(order.timeline) ? order.timeline : []),
          { status: data.status, at: new Date() },
        ],
      },
    });
  }
}
