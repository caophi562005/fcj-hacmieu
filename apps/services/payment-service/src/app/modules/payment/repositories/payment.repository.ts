import { PaymentStatusValues } from '@common/constants/payment.constant';
import {
  GetManyPaymentsRequest,
  GetPaymentRequest,
} from '@common/interfaces/models/payment';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/payment-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyPaymentsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

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
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      payments,
      totalItems,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(totalItems / data.limit),
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

  create(data: Prisma.PaymentCreateInput) {
    return this.prismaService.payment.create({
      data,
    });
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

  async dashboard() {
    const result = await this.prismaService.payment.aggregate({
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  }
}
