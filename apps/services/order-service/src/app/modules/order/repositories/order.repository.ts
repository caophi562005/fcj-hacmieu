import { PaginationConfiguration } from '@common/configurations/pagination.config';
import { OrderStatusValues } from '@common/constants/order.constant';
import { PaymentStatusValues } from '@common/constants/payment.constant';
import {
  CancelOrderRequest,
  CreateOrderRepository,
  GetManyOrdersRequest,
  GetOrderRequest,
  UpdateStatusOrderRequest,
} from '@common/interfaces/models/order';
import { generateCode } from '@common/utils/order-code.util';
import { Injectable } from '@nestjs/common';
import {
  CancellationActorType,
  CancellationStepEffect,
  CancellationStepStatus,
  OrderStatus,
  OutboxEventStatus,
  Prisma,
} from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  assertCancellationAuthorized,
  canCancelOrder,
  isGenericTransitionAllowed,
} from '../services/order-cancellation.policy';

@Injectable()
export class OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyOrdersRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      code: data.code
        ? {
            contains: data.code,
            mode: 'insensitive' as const,
          }
        : undefined,
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
          cancellation: { include: { steps: true } },
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
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        itemTotal: order.itemTotal,
        discount: order.discount,
        voucherDiscount: order.voucherDiscount,
        coinApplied: order.coinApplied,
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
        cancellation: { include: { steps: true } },
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
      latitude?: number;
      longitude?: number;
    };

    const receiver = {
      name: receiverRaw.name || '',
      phone: receiverRaw.phone || '',
      address: receiverRaw.address || '',
      note: receiverRaw.note || undefined,
      latitude: receiverRaw.latitude,
      longitude: receiverRaw.longitude,
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
      voucherDiscount: order.voucherDiscount,
      coinApplied: order.coinApplied,
      grandTotal: order.grandTotal,
      receiver,
      shippingOrigin: order.shippingOrigin ?? null,
      shippingDestination: order.shippingDestination ?? null,
      timeline: Array.isArray(order.timeline) ? order.timeline : [],
      itemsSnapshot: order.items,
      firstProductName: order.items[0]?.productName || '',
      firstProductImage: order.items[0]?.productImage || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      cancellation: order.cancellation,
    };
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
          const grandTotal = Math.max(
            0,
            itemTotal + shopOrder.shippingFee + discount,
          );

          const order = await tx.order.create({
            data: {
              code: generateCode('ORDER'),
              userId: data.userId,
              shopId: shopOrder.shopId,
              sellerId: shopOrder.sellerId,
              status: OrderStatus.PENDING,

              itemTotal: itemTotal,

              shippingFee: shopOrder.shippingFee,

              discount: discount,
              voucherDiscount: shopOrder.voucherDiscount,
              coinApplied: shopOrder.coinApplied,

              grandTotal,

              receiver: data.receiver,
              shippingOrigin: shopOrder.shippingOrigin,
              shippingDestination: shopOrder.shippingDestination,
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

          await tx.outboxEvent.create({
            data: {
              eventType: 'INVENTORY_RESERVE',
              aggregateId: order.id,
              payload: {
                orderId: order.id,
                userId: order.userId,
                items: order.items.map((item) => ({
                  skuId: item.skuId,
                  quantity: item.quantity,
                  productId: item.productId,
                })),
              },
            },
          });
          return order;
        }),
      );
    });
    return orders;
  }

  async cancel(data: CancelOrderRequest) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.prismaService.$transaction(
          async (tx) => {
            const order = await tx.order.findFirst({
              where: { id: data.orderId, deletedAt: null },
              include: {
                items: true,
                cancellation: { include: { steps: true } },
              },
            });
            if (!order) throw new Error('ORDER_NOT_FOUND');

            assertCancellationAuthorized(
              {
                actorType: data.actorType,
                actorId: data.actorId,
                shopId: data.shopId,
              },
              order,
            );

            if (order.cancellation) return order;
            if (!canCancelOrder(order.status)) {
              throw new Error(`ORDER_NOT_CANCELLABLE:${order.status}`);
            }

            const cancelledAt = new Date();
            const changed = await tx.order.updateMany({
              where: {
                id: order.id,
                status: order.status,
                deletedAt: null,
              },
              data: {
                status: OrderStatus.CANCELLED,
                paymentStatus:
                  order.paymentMethod === 'COD'
                    ? 'CANCELLED'
                    : order.paymentStatus,
                timeline: [
                  ...(Array.isArray(order.timeline) ? order.timeline : []),
                  { status: OrderStatus.CANCELLED, at: cancelledAt },
                ],
                updatedById: data.actorId,
              },
            });
            if (changed.count !== 1) throw new Error('ORDER_CANCEL_CONFLICT');

            const cancellation = await tx.orderCancellation.create({
              data: {
                orderId: order.id,
                processId: data.processId,
                actorType: data.actorType as CancellationActorType,
                actorId: data.actorId,
                reasonCode: data.reasonCode,
                reasonNote: data.reasonNote,
                cancelledAt,
                steps: {
                  create: [
                    { effect: CancellationStepEffect.INVENTORY },
                    { effect: CancellationStepEffect.PAYMENT },
                    {
                      effect: CancellationStepEffect.WALLET,
                      status:
                        order.coinApplied > 0
                          ? CancellationStepStatus.PENDING
                          : CancellationStepStatus.NOT_REQUIRED,
                    },
                    {
                      effect: CancellationStepEffect.PROMOTION,
                      status:
                        order.voucherDiscount > 0
                          ? CancellationStepStatus.PENDING
                          : CancellationStepStatus.NOT_REQUIRED,
                    },
                    { effect: CancellationStepEffect.NOTIFICATION },
                    {
                      effect: CancellationStepEffect.SHIPMENT,
                      status: CancellationStepStatus.NOT_REQUIRED,
                      detail: 'Shipment creation is not implemented; GHN is fee-only.',
                    },
                  ],
                },
              },
            });

            const basePayload = {
              cancellationId: cancellation.id,
              orderId: order.id,
              processId: data.processId,
              userId: order.userId,
              shopId: order.shopId,
              sellerUserId: order.sellerId ?? order.shopId,
              reasonCode: data.reasonCode,
              reasonNote: data.reasonNote,
            };
            const events: Array<{ eventType: string; payload: Prisma.InputJsonObject }> = [
              {
                eventType: 'INVENTORY_RELEASE',
                payload: {
                  ...basePayload,
                  items: order.items.map((item) => ({
                    skuId: item.skuId,
                    quantity: item.quantity,
                  })),
                },
              },
              {
                eventType: 'PAYMENT_CANCEL',
                payload: {
                  ...basePayload,
                  paymentId: order.paymentId,
                  paymentMethod: order.paymentMethod,
                  amount: order.grandTotal,
                },
              },
              {
                eventType: 'ORDER_CANCELLED_NOTIFICATION',
                payload: basePayload,
              },
            ];
            if (order.coinApplied > 0) {
              events.push({
                eventType: 'WALLET_REFUND',
                payload: { ...basePayload, amount: order.coinApplied },
              });
            }
            if (order.voucherDiscount > 0) {
              events.push({
                eventType: 'PROMOTION_RELEASE',
                payload: basePayload,
              });
            }
            await tx.outboxEvent.createMany({
              data: events.map((event) => ({
                eventType: event.eventType,
                aggregateId: order.id,
                payload: event.payload,
              })),
              skipDuplicates: true,
            });

            return tx.order.findUniqueOrThrow({
              where: { id: order.id },
              include: {
                items: true,
                cancellation: { include: { steps: true } },
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error: unknown) {
        const code =
          typeof error === 'object' && error !== null && 'code' in error
            ? String(error.code)
            : undefined;
        const message = error instanceof Error ? error.message : '';
        if (
          (code === 'P2002' ||
            code === 'P2034' ||
            message === 'ORDER_CANCEL_CONFLICT') &&
          attempt < maxAttempts
        ) {
          continue;
        }
        if (code === 'P2002') {
          const existing = await this.prismaService.order.findUnique({
            where: { id: data.orderId },
            include: { items: true, cancellation: { include: { steps: true } } },
          });
          if (existing?.cancellation) return existing;
        }
        if (message === 'ORDER_CANCEL_CONFLICT') {
          const existing = await this.prismaService.order.findUnique({
            where: { id: data.orderId },
            include: { items: true, cancellation: { include: { steps: true } } },
          });
          if (existing?.cancellation) return existing;
        }
        throw error;
      }
    }
    throw new Error('ORDER_CANCEL_RETRY_EXHAUSTED');
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

    return this.prismaService.$transaction(async (tx) => {
      const paidOrders = [];
      for (const order of orders) {
        const changed = await tx.order.updateMany({
          where: {
            id: order.id,
            status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
            paymentStatus: PaymentStatusValues.PENDING,
            cancellation: null,
          },
          data: {
            status: OrderStatus.CONFIRMED,
            timeline: [
              ...(Array.isArray(order.timeline) ? order.timeline : []),
              { status: OrderStatus.CONFIRMED, at: new Date() },
            ],
            paymentStatus: PaymentStatusValues.SUCCESS,
          },
        });
        if (changed.count === 1) {
          paidOrders.push(await tx.order.findUniqueOrThrow({ where: { id: order.id } }));
        }
      }
      return paidOrders;
    });
  }

  async updateStatus(
    data: UpdateStatusOrderRequest,
    settlementPolicy: { commissionRate: number; taxRate: number },
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id: data.id },
      });
      if (data.shopId && order.shopId !== data.shopId) throw new Error('ORDER_NOT_AUTHORIZED');
      if (!isGenericTransitionAllowed(order.status, data.status)) {
        throw new Error(`ORDER_TRANSITION_NOT_ALLOWED:${order.status}:${data.status}`);
      }
      const changed = await tx.order.updateMany({
        where: { id: data.id, status: order.status, cancellation: null },
        data: {
          status: data.status as OrderStatus,
          timeline: [
            ...(Array.isArray(order.timeline) ? order.timeline : []),
            { status: data.status, at: new Date() },
          ],
        },
      });
      if (changed.count !== 1) throw new Error('ORDER_STATUS_CONFLICT');
      const updated = await tx.order.findUniqueOrThrow({ where: { id: data.id } });

      if (updated.status === OrderStatus.COMPLETED) {
        const commissionFee = Math.floor(
          (updated.itemTotal * settlementPolicy.commissionRate) / 100,
        );
        const taxWithheld = Math.floor(
          (updated.itemTotal * settlementPolicy.taxRate) / 100,
        );
        const payload = {
          orderId: updated.id,
          shopId: updated.shopId,
          grossAmount: updated.itemTotal,
          commissionRate: settlementPolicy.commissionRate,
          commissionFee,
          taxRate: settlementPolicy.taxRate,
          taxWithheld,
          netSellerAmount: Math.max(
            0,
            updated.itemTotal - commissionFee - taxWithheld,
          ),
          completedAt: updated.updatedAt.toISOString(),
        } satisfies Prisma.InputJsonObject;

        await tx.outboxEvent.upsert({
          where: {
            eventType_aggregateId: {
              eventType: 'ORDER_COMPLETED',
              aggregateId: updated.id,
            },
          },
          update: {},
          create: {
            eventType: 'ORDER_COMPLETED',
            aggregateId: updated.id,
            payload,
          },
        });
      }

      return updated;
    });
  }

  async getCompletedSoldCountsForOrder(orderId: string) {
    const orderItems = await this.prismaService.orderItem.findMany({
      where: { orderId },
      select: { productId: true },
    });
    const productIds = Array.from(
      new Set(orderItems.map((item) => item.productId)),
    );
    if (productIds.length === 0) return [];

    const completedItems = await this.prismaService.orderItem.findMany({
      where: {
        productId: { in: productIds },
        order: { status: OrderStatus.COMPLETED, deletedAt: null },
      },
      select: { productId: true, quantity: true },
    });

    const totals = new Map<string, number>();
    for (const item of completedItems) {
      totals.set(
        item.productId,
        (totals.get(item.productId) ?? 0) + item.quantity,
      );
    }

    return productIds.map((productId) => ({
      productId,
      soldCount: totals.get(productId) ?? 0,
    }));
  }

  async claimOutboxEvents(batchSize: number) {
    const now = new Date();
    const leaseExpiredAt = new Date(now.getTime() - 5 * 60 * 1000);
    await this.prismaService.outboxEvent.updateMany({
      where: {
        status: OutboxEventStatus.PROCESSING,
        processingStartedAt: { lt: leaseExpiredAt },
      },
      data: {
        status: OutboxEventStatus.PENDING,
        processingStartedAt: null,
        lastError: 'Publishing lease expired; event queued for retry.',
      },
    });

    const candidates = await this.prismaService.outboxEvent.findMany({
      where: { status: OutboxEventStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      take: batchSize,
      select: { id: true },
    });

    const claimed = [];
    for (const candidate of candidates) {
      const result = await this.prismaService.outboxEvent.updateMany({
        where: { id: candidate.id, status: OutboxEventStatus.PENDING },
        data: {
          status: OutboxEventStatus.PROCESSING,
          processingStartedAt: now,
          attemptCount: { increment: 1 },
          lastError: null,
        },
      });
      if (result.count === 1) {
        const event = await this.prismaService.outboxEvent.findUnique({
          where: { id: candidate.id },
        });
        if (event) claimed.push(event);
      }
    }
    return claimed;
  }

  markOutboxPublished(id: string) {
    return this.prismaService.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxEventStatus.PUBLISHED,
        publishedAt: new Date(),
        processingStartedAt: null,
        lastError: null,
      },
    });
  }

  markOutboxFailed(id: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return this.prismaService.outboxEvent.updateMany({
      where: { id, status: OutboxEventStatus.PROCESSING },
      data: {
        status: OutboxEventStatus.PENDING,
        processingStartedAt: null,
        lastError: message.slice(0, 1000),
      },
    });
  }

  async recordCancellationResult(data: {
    cancellationId: string;
    effect: string;
    status: 'COMPLETED' | 'FAILED';
    detail?: string;
    paymentStatus?: 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';
  }) {
    return this.prismaService.$transaction(async (tx) => {
      const result = await tx.orderCancellationStep.updateMany({
        where: {
          cancellationId: data.cancellationId,
          effect: data.effect as CancellationStepEffect,
        },
        data: {
          status: data.status as CancellationStepStatus,
          detail: data.detail,
          completedAt: data.status === 'COMPLETED' ? new Date() : null,
        },
      });
      if (data.paymentStatus) {
        await tx.order.updateMany({
          where: { cancellation: { id: data.cancellationId } },
          data: { paymentStatus: data.paymentStatus },
        });
      }
      return result;
    });
  }
}
