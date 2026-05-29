import {
  CreditTransactionSourceValues,
  CreditTransactionTypeValues,
} from '@common/constants/credit.constant';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  AdjustShopCreditRequest,
  GetShopCreditTransactionsRequest,
  GetShopRevenueSummaryRequest,
} from '@common/interfaces/models/wallet';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CreditRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsert(shopId: string) {
    return this.prismaService.credit.upsert({
      where: { shopId },
      update: {},
      create: { shopId, balance: 0 },
    });
  }

  async adjust(data: AdjustShopCreditRequest) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const credit = await tx.credit.upsert({
          where: { shopId: data.shopId },
          update: {},
          create: { shopId: data.shopId, balance: 0 },
        });

        const isOrderRevenueSettlement =
          data.source === CreditTransactionSourceValues.ORDER_REVENUE &&
          !!data.referenceId;

        if (isOrderRevenueSettlement) {
          const settledTransaction = await tx.creditTransaction.findFirst({
            where: {
              shopId: data.shopId,
              source: CreditTransactionSourceValues.ORDER_REVENUE,
              referenceId: data.referenceId,
            },
            select: { id: true },
          });

          if (settledTransaction) {
            return credit;
          }
        }

        const delta =
          data.type === CreditTransactionTypeValues.CREDIT
            ? data.amount
            : -data.amount;

        const newBalance = credit.balance + delta;
        if (newBalance < 0) {
          throw new BadRequestException('Error.CreditInsufficientBalance');
        }

        const updated = await tx.credit.update({
          where: { id: credit.id },
          data: { balance: newBalance },
        });

        await tx.creditTransaction.create({
          data: {
            creditId: credit.id,
            shopId: data.shopId,
            type: data.type,
            source: data.source,
            referenceId: data.referenceId ?? null,
            amount: data.amount,
            balanceAfter: newBalance,
            description: data.description,
          },
        });

        return updated;
      });
    } catch (error) {
      const isDuplicateSettlement =
        error?.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION &&
        data.source === CreditTransactionSourceValues.ORDER_REVENUE &&
        !!data.referenceId;

      if (isDuplicateSettlement) {
        return this.upsert(data.shopId);
      }

      throw error;
    }
  }

  async listTransactions(data: GetShopCreditTransactionsRequest) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CreditTransactionWhereInput = { shopId: data.shopId };
    if (data.type) where.type = data.type;
    if (data.source) where.source = data.source;

    const [transactions, totalItems] = await Promise.all([
      this.prismaService.creditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.creditTransaction.count({ where }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      transactions,
    };
  }

  async getRevenueSummary(data: GetShopRevenueSummaryRequest) {
    const days = data.days || 7;
    const today = new Date();
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const transactions = await this.prismaService.creditTransaction.findMany({
      where: {
        shopId: data.shopId,
        source: CreditTransactionSourceValues.ORDER_REVENUE,
        type: CreditTransactionTypeValues.CREDIT,
        createdAt: {
          gte: start,
          lte: endOfToday,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatDateLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const points = Array.from({ length: days }, (_, idx) => {
      const day = new Date(start);
      day.setDate(start.getDate() + idx);
      return {
        date: formatDateLocal(day),
        amount: 0,
      };
    });

    const pointMap = new Map(points.map((p) => [p.date, p]));

    for (const tx of transactions) {
      const date = formatDateLocal(tx.createdAt);
      const point = pointMap.get(date);
      if (point) {
        point.amount += tx.amount;
      }
    }

    return {
      days,
      totalRevenue: points.reduce((sum, p) => sum + p.amount, 0),
      points,
    };
  }
}
