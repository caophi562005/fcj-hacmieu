import { OrderStatusValues } from '@common/constants/order.constant';
import { PaymentStatusValues } from '@common/constants/payment.constant';
import {
  CreateOrderRepository,
  DashboardSellerRequest,
  UpdateStatusOrderRequest,
} from '@common/interfaces/models/order';
import { generateCode } from '@common/utils/order-code.util';
import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma-client/order-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

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

  async dashboardSeller(data: DashboardSellerRequest) {
    const whereBase = {
      shopId: data.shopId,
    };

    const [statusCounts, revenueAgg] = await Promise.all([
      this.prismaService.order.groupBy({
        by: ['status'],
        where: whereBase,
        _count: { _all: true },
      }),

      this.prismaService.order.aggregate({
        where: {
          ...whereBase,
          status: OrderStatus.COMPLETED,
        },
        _sum: {
          grandTotal: true,
        },
      }),
    ]);

    // Map status → count
    const countMap = Object.fromEntries(
      statusCounts.map((i) => [i.status, i._count._all]),
    );

    return {
      totalOrders: statusCounts.reduce((sum, i) => sum + i._count._all, 0),
      pendingOrders: countMap[OrderStatus.PENDING] ?? 0,
      confirmedOrders: countMap[OrderStatus.CONFIRMED] ?? 0,
      completedOrders: countMap[OrderStatus.COMPLETED] ?? 0,
      totalRevenue: revenueAgg._sum.grandTotal ?? 0,
    };
  }
}
