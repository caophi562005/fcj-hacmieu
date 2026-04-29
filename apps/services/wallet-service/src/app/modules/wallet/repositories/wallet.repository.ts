import { WalletTransactionTypeValues } from '@common/constants/wallet.constant';
import {
  AdjustWalletRequest,
  GetMyTransactionsRequest,
} from '@common/interfaces/models/wallet';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WalletRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsert(userId: string) {
    return this.prismaService.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId, balance: 0 },
    });
  }

  async adjust(data: AdjustWalletRequest) {
    return this.prismaService.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId: data.userId },
        update: {},
        create: { userId: data.userId, balance: 0 },
      });

      const delta =
        data.type === WalletTransactionTypeValues.CREDIT
          ? data.amount
          : -data.amount;

      const newBalance = wallet.balance + delta;
      if (newBalance < 0) {
        throw new BadRequestException('Error.WalletInsufficientBalance');
      }

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: data.userId,
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

  async listTransactions(data: GetMyTransactionsRequest) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = { userId: data.userId };
    if (data.type) where.type = data.type;
    if (data.source) where.source = data.source;

    const [transactions, totalItems] = await Promise.all([
      this.prismaService.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.walletTransaction.count({ where }),
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
