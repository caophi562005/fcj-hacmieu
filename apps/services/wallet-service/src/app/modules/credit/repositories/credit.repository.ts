import { CreditTransactionTypeValues } from '@common/constants/credit.constant';
import {
  AdjustShopCreditRequest,
  GetShopCreditTransactionsRequest,
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
    return this.prismaService.$transaction(async (tx) => {
      const credit = await tx.credit.upsert({
        where: { shopId: data.shopId },
        update: {},
        create: { shopId: data.shopId, balance: 0 },
      });

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
}
