import {
  CreateRefundRequest,
  GetManyRefundsRequest,
  GetRefundRequest,
  UpdateRefundStatusRequest,
} from '@common/interfaces/models/payment';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/payment-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RefundRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyRefundsRequest) {
    const page = Number(data?.page) > 0 ? Number(data.page) : 1;
    const limit = Number(data?.limit) > 0 ? Number(data.limit) : 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const whereClause: Prisma.RefundWhereInput = {
      userId: data.userId || undefined,
      orderId: data.orderId || undefined,
      status: data.status || undefined,
      deletedAt: null,
    };

    const [totalItems, refunds] = await Promise.all([
      this.prismaService.refund.count({
        where: whereClause,
      }),
      this.prismaService.refund.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      refunds,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  getOne(data: GetRefundRequest) {
    return this.prismaService.refund.findFirst({
      where: {
        id: data.id,
        userId: data.userId || undefined,
        deletedAt: null,
      },
    });
  }

  create(data: Omit<CreateRefundRequest, 'processId'>) {
    return this.prismaService.refund.create({
      data,
    });
  }

  updateStatus(data: UpdateRefundStatusRequest) {
    return this.prismaService.refund.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
        updatedById: data.updatedById,
      },
    });
  }
}
