import { PaginationConfiguration } from '@common/configurations/pagination.config';
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
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.prismaService.$transaction(
          async (tx) => {
            const wallet = await tx.wallet.upsert({
              where: { userId: data.userId },
              update: {},
              create: { userId: data.userId, balance: 0 },
            });

            // Financial commands with the same business reference are
            // idempotent. A database unique constraint backs this check.
            if (data.referenceId) {
              const processed = await tx.walletTransaction.findFirst({
                where: {
                  userId: data.userId,
                  source: data.source,
                  referenceId: data.referenceId,
                },
                select: { id: true },
              });
              if (processed) return wallet;
            }

            if (data.type === WalletTransactionTypeValues.CREDIT) {
              await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: data.amount } },
              });
            } else {
              const debited = await tx.wallet.updateMany({
                where: { id: wallet.id, balance: { gte: data.amount } },
                data: { balance: { decrement: data.amount } },
              });
              if (debited.count !== 1) {
                throw new BadRequestException(
                  'Error.WalletInsufficientBalance',
                );
              }
            }

            const updated = await tx.wallet.findUniqueOrThrow({
              where: { id: wallet.id },
            });

            await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                userId: data.userId,
                type: data.type,
                source: data.source,
                referenceId: data.referenceId ?? null,
                amount: data.amount,
                balanceAfter: updated.balance,
                description: data.description,
              },
            });

            return updated;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error: unknown) {
        const code =
          typeof error === 'object' && error !== null && 'code' in error
            ? String(error.code)
            : undefined;
        if ((code === 'P2002' || code === 'P2034') && attempt < maxAttempts) {
          continue;
        }
        throw error;
      }
    }

    throw new Error('Wallet transaction retry limit exceeded');
  }

  async listTransactions(data: GetMyTransactionsRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
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
