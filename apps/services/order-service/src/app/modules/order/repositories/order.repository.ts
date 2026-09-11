import { isDatabaseDemoActive } from '@common/configurations/database-demo.config';
import { PaginationConfiguration } from '@common/configurations/pagination.config';
import { OrderStatusValues } from '@common/constants/order.constant';
import { PaymentStatusValues } from '@common/constants/payment.constant';
import {
  CreateOrderRepository,
  GetManyOrdersRequest,
  GetOrderRequest,
  UpdateStatusOrderRequest,
} from '@common/interfaces/models/order';
import { generateCode } from '@common/utils/order-code.util';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma-client/order-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async calculateDiscount(data: {
    type: string;
    value: number;
    subtotal: number;
    maxDiscount?: number;
  }) {
    const [row] = await this.prismaService.$queryRaw<
      Array<{ discountAmount: number }>
    >`
      SELECT fn_calculate_discount(
        ${data.type}, ${data.value}, ${data.subtotal},
        ${data.maxDiscount ?? null}
      ) AS discountAmount
    `;
    return Number(row?.discountAmount ?? 0);
  }

  async list(data: GetManyOrdersRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      code: data.code
        ? // MySQL không có `mode: 'insensitive'`. Cột dùng collation
          // utf8mb4_unicode_ci nên `contains` vốn đã không phân biệt hoa thường.
          {
            contains: data.code,
          }
        : undefined,
      paymentId: data.paymentId || undefined,
      status: data.status || undefined,
      userId: data.userId || undefined,
      shopId: data.shopId || undefined,
    };

    let orders;
    let totalItems;

    if (isDatabaseDemoActive('5.4')) {
      // DEMO LỖI 5.4 - PHANTOM READ / INCONSISTENT PAGINATION:
      // Tạo thêm một Order phù hợp trong 5 giây giữa truy vấn list và count.
      [orders, totalItems] = await this.prismaService.$transaction(
        async (tx) => {
          const orders = await tx.order.findMany({
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
          });
          await tx.$queryRaw(Prisma.sql`SELECT SLEEP(5)`);
          const totalItems = await tx.order.count({ where });
          return [orders, totalItems] as const;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
          timeout: 20_000,
        },
      );
    } else {
      // BẢN ĐÚNG 5.4
      [orders, totalItems] = await this.prismaService.$transaction(
        [
          this.prismaService.order.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
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
        ],
        {
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        },
      );
    }

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      orders: orders.map((order) => ({
        id: order.id,
        code: order.code,
        shopId: order.shopId,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        itemTotal: order.itemTotal,
        discount: order.discount,
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
      note?: string;
    };

    const receiver = {
      name: receiverRaw.name || '',
      phone: receiverRaw.phone || '',
      address: receiverRaw.address || '',
      note: receiverRaw.note || undefined,
    };

    return {
      id: order.id,
      code: order.code,
      userId: order.userId,
      shopId: order.shopId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      itemTotal: order.itemTotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      grandTotal: order.grandTotal,
      receiver,
      timeline: Array.isArray(order.timeline) ? order.timeline : [],
      itemsSnapshot: order.items,
      firstProductName: order.items[0]?.productName || '',
      firstProductImage: order.items[0]?.productImage || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  findCancellable(orderId: string, userId?: string, shopId?: string) {
    return this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId: userId || undefined,
        shopId: shopId || undefined,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
        },
        deletedAt: null,
      },
      include: {
        items: {
          select: {
            skuId: true,
            productId: true,
            quantity: true,
          },
        },
      },
    });
  }

  async create(data: CreateOrderRepository) {
    const orders = await this.prismaService.$transaction(async (tx) => {
      return Promise.all(
        data.orders.map(async (shopOrder) => {
          const itemTotal =
            shopOrder.itemTotal ||
            shopOrder.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            );
          const discount = shopOrder.discount || 0;
          const [totalRow] = await tx.$queryRaw<Array<{ grandTotal: number }>>`
            SELECT fn_order_grand_total(
              ${itemTotal}, ${data.shippingFee}, ${discount}
            ) AS grandTotal
          `;
          const grandTotal = Number(totalRow?.grandTotal ?? 0);

          return tx.order.create({
            data: {
              code: generateCode('ORDER'),
              userId: data.userId,
              shopId: shopOrder.shopId,
              status: OrderStatus.PENDING,

              itemTotal: itemTotal,

              shippingFee: data.shippingFee,

              discount: discount,

              grandTotal,

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
        status: {
          in: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
        },
        deletedAt: null,
      },
      include: {
        items: {
          select: {
            skuId: true,
            productId: true,
            quantity: true,
          },
        },
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
            status: OrderStatusValues.CONFIRMED,
            timeline: [
              ...(Array.isArray(order.timeline) ? order.timeline : []),
              { status: OrderStatusValues.CONFIRMED, at: new Date() },
            ],
            paymentStatus: PaymentStatusValues.SUCCESS,
          },
        }),
      ),
    );
  }

  async updateStatus(data: UpdateStatusOrderRequest) {
    try {
      await this.prismaService.$queryRaw`
        CALL sp_change_order_status(
          ${data.id}, ${data.shopId ?? null}, ${data.status},
          ${null}
        )
      `;
    } catch (error) {
      if (String(error).includes('ORDER_NOT_FOUND')) {
        throw new NotFoundException('Error.OrderNotFound');
      }
      if (String(error).includes('ORDER_STATUS_TRANSITION_INVALID')) {
        throw new BadRequestException('Error.InvalidOrderStatusTransition');
      }
      throw error;
    }

    return this.prismaService.order.findUniqueOrThrow({
      where: { id: data.id },
    });
  }
}
