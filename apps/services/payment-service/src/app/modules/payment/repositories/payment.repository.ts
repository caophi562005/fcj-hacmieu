import { PaginationConfiguration } from '@common/configurations/pagination.config';
import { PaymentStatusValues } from '@common/constants/payment.constant';
import {
  GetManyPaymentsRequest,
  GetPaymentRequest,
} from '@common/interfaces/models/payment';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { classifyPaymentCancellation } from '../services/payment-cancellation.policy';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyPaymentsRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PaymentWhereInput = {
      userId: data?.userId || undefined,
      method: data?.method || undefined,
      status: data?.status || undefined,
      amount: data?.amount || undefined,
      code: data?.code
        ? { contains: data.code, mode: 'insensitive' }
        : undefined,
      createdAt: data?.createdAt ? { lte: data.createdAt } : undefined,
    };

    const [totalItems, payments] = await Promise.all([
      this.prismaService.payment.count({
        where: whereClause,
      }),
      this.prismaService.payment.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      payments,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  getOne(data: GetPaymentRequest) {
    return this.prismaService.payment.findUnique({
      where: {
        id: data.id,
        userId: data?.userId ?? undefined,
      },
    });
  }

  async create(
    data: Prisma.PaymentUncheckedCreateInput & {
      allocations?: Array<{ orderId: string; amount: number }>;
    },
  ) {
    const { allocations = [], ...paymentData } = data;
    return this.prismaService.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { id: data.id } });
      if (existing) return existing;
      const cancelled = await tx.paymentCancellationCommand.findMany({
        where: { orderId: { in: allocations.map((item) => item.orderId) } },
        select: { orderId: true },
      });
      const cancelledIds = new Set(cancelled.map((item) => item.orderId));
      const allCancelled =
        allocations.length > 0 &&
        allocations.every((item) => cancelledIds.has(item.orderId));
      return tx.payment.create({
        data: {
          ...paymentData,
          status: allCancelled ? PaymentStatusValues.CANCELLED : paymentData.status,
          allocations: {
            create: allocations.map((item) => ({
              ...item,
              status: cancelledIds.has(item.orderId) ? 'CANCELLED' : 'PENDING',
            })),
          },
        },
      });
    });
  }

  async cancelOrderPayment(data: {
    eventId: string;
    cancellationId: string;
    orderId: string;
    paymentId: string;
    userId: string;
    amount: number;
    reasonCode: string;
  }): Promise<'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED'> {
    return this.prismaService.$transaction(
      async (tx) => {
        await tx.paymentCancellationCommand.upsert({
          where: { orderId: data.orderId },
          update: {},
          create: data,
        });
        const payment = await tx.payment.findUnique({
          where: { id: data.paymentId },
          include: { allocations: true },
        });
        if (!payment) return 'CANCELLED';

        const allocation = payment.allocations.find(
          (item) => item.orderId === data.orderId,
        );
        const currentStatus = allocation?.status ?? payment.status;
        if (currentStatus === 'REFUNDED') return 'REFUNDED';
        if (currentStatus === 'REFUND_PENDING') return 'REFUND_PENDING';

        const target = classifyPaymentCancellation(currentStatus, payment.method);
        if (allocation) {
          await tx.paymentAllocation.updateMany({
            where: {
              id: allocation.id,
              status: { in: ['PENDING', 'SUCCESS'] },
            },
            data: { status: target },
          });
        } else {
          await tx.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              orderId: data.orderId,
              amount: data.amount,
              status: target,
            },
          });
        }
        if (target === 'REFUND_PENDING') {
          await tx.refund.upsert({
            where: { orderId: data.orderId },
            update: {},
            create: {
              orderId: data.orderId,
              userId: data.userId,
              amount: allocation?.amount ?? data.amount,
              status: 'PENDING',
              reason: data.reasonCode,
            },
          });
        }

        const active = await tx.paymentAllocation.count({
          where: {
            paymentId: payment.id,
            status: { in: ['PENDING', 'SUCCESS'] },
          },
        });
        if (active === 0) {
          const refundPending = await tx.paymentAllocation.count({
            where: { paymentId: payment.id, status: 'REFUND_PENDING' },
          });
          await tx.payment.updateMany({
            where: { id: payment.id },
            data: {
              status: refundPending > 0 ? 'REFUND_PENDING' : 'CANCELLED',
            },
          });
        }
        return target;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  update(data: Prisma.PaymentUpdateInput) {
    return this.prismaService.payment.update({
      where: {
        id: data.id as string,
      },
      data: {
        status: data.status,
        updatedById: data.updatedById as string,
      },
    });
  }

  delete(data: Prisma.PaymentWhereInput, isHard?: boolean) {
    return isHard
      ? this.prismaService.payment.delete({
          where: {
            id: data.id as string,
          },
        })
      : this.prismaService.payment.update({
          where: {
            id: data.id as string,
            deletedAt: null,
          },
          data: {
            status: PaymentStatusValues.CANCELLED,
            deletedAt: new Date(),
            deletedById: data.deletedById as string,
          },
        });
  }
}
