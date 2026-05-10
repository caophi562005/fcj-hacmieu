import { PaginationConfiguration } from '@common/configurations/pagination.config';
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
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

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
        take: limit,
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
