import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

export interface RecordPlatformLedgerData {
  orderId: string;
  shopId: string;
  grossAmount: number;
  commissionRate: number;
  commissionFee: number;
  taxRate: number;
  taxWithheld: number;
  netSellerAmount: number;
}

export interface ListPlatformLedgerQuery {
  page: number;
  limit: number;
  shopId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'grossAmount' | 'commissionFee';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class PlatformLedgerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: RecordPlatformLedgerData) {
    return this.prismaService.platformLedger.upsert({
      where: { orderId: data.orderId },
      update: data,
      create: data,
    });
  }

  async list(query: ListPlatformLedgerQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PlatformLedgerWhereInput = {};

    if (query.shopId) {
      where.shopId = query.shopId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [items, totalItems] = await Promise.all([
      this.prismaService.platformLedger.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prismaService.platformLedger.count({ where }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      items,
    };
  }

  async getSummary(query: { shopId?: string; startDate?: string; endDate?: string }) {
    const where: Prisma.PlatformLedgerWhereInput = {};

    if (query.shopId) {
      where.shopId = query.shopId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [aggregations, pendingPayoutAgg] = await Promise.all([
      this.prismaService.platformLedger.aggregate({
        where,
        _sum: {
          grossAmount: true,
          commissionFee: true,
          taxWithheld: true,
          netSellerAmount: true,
        },
      }),
      this.prismaService.payoutRequest.aggregate({
        where: {
          status: 'PENDING',
          ...(query.shopId ? { shopId: query.shopId } : {}),
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalGMV: aggregations._sum.grossAmount || 0,
      totalCommission: aggregations._sum.commissionFee || 0,
      totalTaxWithheld: aggregations._sum.taxWithheld || 0,
      totalNetSellerAmount: aggregations._sum.netSellerAmount || 0,
      totalPendingPayouts: pendingPayoutAgg._sum.amount || 0,
    };
  }
}
