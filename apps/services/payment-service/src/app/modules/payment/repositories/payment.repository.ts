import { PaginationConfiguration } from '@common/configurations/pagination.config';
import { isDatabaseDemoActive } from '@common/configurations/database-demo.config';
import { PaymentStatusValues } from '@common/constants/payment.constant';
import {
  GetManyPaymentsRequest,
  GetPaymentRequest,
} from '@common/interfaces/models/payment';
import { readStringList } from '@common/utils/scalar-list.util';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/payment-service';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Đưa `orderId` từ cột JSON về `string[]` để hợp đồng gRPC không đổi.
 *
 * Trên PostgreSQL đây là `String[]`, nay là cột JSON vì MySQL không có kiểu mảng.
 */
function toPaymentRow<T extends { id: string; orderId: unknown }>(
  row: T,
): Omit<T, 'orderId'> & { orderId: string[] } {
  return {
    ...row,
    orderId: readStringList(row.orderId, {
      model: 'Payment',
      field: 'orderId',
      key: row.id,
    }),
  };
}

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
      // MySQL không có `mode: 'insensitive'`. Cột dùng collation
      // utf8mb4_unicode_ci nên `contains` vốn đã không phân biệt hoa thường.
      code: data?.code ? { contains: data.code } : undefined,
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
      payments: payments.map(toPaymentRow),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getOne(data: GetPaymentRequest) {
    if (isDatabaseDemoActive('5.2')) {
      // DEMO LỖI 5.2 - DIRTY READ:
      // Trong 5 giây chờ, UPDATE Payment ở session MySQL khác nhưng chưa COMMIT.
      const row = await this.prismaService.$transaction(
        async (tx) => {
          await tx.$queryRaw(Prisma.sql`SELECT SLEEP(5)`);
          return tx.payment.findUnique({
            where: {
              id: data.id,
              userId: data?.userId ?? undefined,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadUncommitted,
          timeout: 20_000,
        },
      );
      return row ? toPaymentRow(row) : null;
    }

    // BẢN ĐÚNG 5.2
    const row = await this.prismaService.$transaction(
      (tx) =>
        tx.payment.findUnique({
          where: {
            id: data.id,
            userId: data?.userId ?? undefined,
          },
        }),
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10_000,
      },
    );
    return row ? toPaymentRow(row) : null;
  }

  async create(data: Prisma.PaymentCreateInput) {
    return toPaymentRow(await this.prismaService.payment.create({ data }));
  }

  async update(data: Prisma.PaymentUpdateInput) {
    return toPaymentRow(
      await this.prismaService.payment.update({
        where: {
          id: data.id as string,
        },
        data: {
          status: data.status,
          updatedById: data.updatedById as string,
        },
      }),
    );
  }

  async delete(data: Prisma.PaymentWhereInput, isHard?: boolean) {
    const row = isHard
      ? await this.prismaService.payment.delete({
          where: {
            id: data.id as string,
          },
        })
      : await this.prismaService.payment.update({
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

    return toPaymentRow(row);
  }
}
