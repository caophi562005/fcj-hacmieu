import { PaginationConfiguration } from '@common/configurations/pagination.config';
import { isDatabaseDemoActive } from '@common/configurations/database-demo.config';
import {
  AdjustWalletRequest,
  GetMyTransactionsRequest,
} from '@common/interfaces/models/wallet';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Prisma,
  WalletTransactionSource,
  WalletTransactionType,
} from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WalletRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsert(userId: string) {
    const wallet = await this.prismaService.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId, balance: 0 },
    });

    const [row] = await this.prismaService.$queryRaw<
      Array<{ balance: number }>
    >`SELECT fn_wallet_available_balance(${userId}) AS balance`;

    return { ...wallet, balance: Number(row?.balance ?? 0) };
  }

  async adjust(data: AdjustWalletRequest) {
    if (isDatabaseDemoActive('5.1')) {
      // DEMO LỖI 5.1 - LOST UPDATE:
      // Hai request cùng đọc balance cũ, chờ 5 giây rồi cùng ghi giá trị tuyệt đối.
      const wallet = await this.prismaService.wallet.upsert({
        where: { userId: data.userId },
        update: {},
        create: { userId: data.userId, balance: 0 },
      });
      const delta =
        data.type === WalletTransactionType.CREDIT ? data.amount : -data.amount;
      const newBalance = wallet.balance + delta;
      if (newBalance < 0) {
        throw new BadRequestException('Error.WalletInsufficientBalance');
      }

      await this.prismaService.$queryRaw(Prisma.sql`SELECT SLEEP(5)`);
      return this.prismaService.$transaction(async (tx) => {
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

    // BẢN ĐÚNG 5.1
    try {
      await this.prismaService.$queryRaw`
        CALL sp_adjust_wallet(
          ${data.userId}, ${data.type}, ${data.source},
          ${data.referenceId ?? null}, ${data.amount}, ${data.description}
        )
      `;
    } catch (error) {
      if (String(error).includes('WALLET_INSUFFICIENT_BALANCE')) {
        throw new BadRequestException('Error.WalletInsufficientBalance');
      }
      if (String(error).includes('WALLET_AMOUNT_INVALID')) {
        throw new BadRequestException('Error.InvalidAmount');
      }
      throw error;
    }
    return this.prismaService.wallet.findUniqueOrThrow({
      where: { userId: data.userId },
    });
  }

  async listTransactions(data: GetMyTransactionsRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const filters = [Prisma.sql`wt.userId = ${data.userId}`];
    if (data.type) filters.push(Prisma.sql`wt.type = ${data.type}`);
    if (data.source) filters.push(Prisma.sql`wt.source = ${data.source}`);
    const where = Prisma.join(filters, ' AND ');

    const [rawTransactions, countRows] = await Promise.all([
      this.prismaService.$queryRaw<
        Array<{
          id: string;
          walletId: string;
          userId: string;
          type: WalletTransactionType;
          source: WalletTransactionSource;
          referenceId: string | null;
          amount: number;
          balanceAfter: number;
          description: string;
          createdAt: Date;
        }>
      >(Prisma.sql`
        SELECT wt.id, wt.walletId, wt.userId, wt.type, wt.source,
               wt.referenceId, wt.amount, wt.balanceAfter,
               wt.description, wt.createdAt
          FROM vw_wallet_transaction_history wt
         WHERE ${where}
         ORDER BY wt.createdAt DESC
         LIMIT ${limit} OFFSET ${skip}
      `),
      this.prismaService.$queryRaw<Array<{ totalItems: bigint | number }>>(
        Prisma.sql`
          SELECT COUNT(*) AS totalItems
            FROM vw_wallet_transaction_history wt
           WHERE ${where}
        `,
      ),
    ]);
    const totalItems = Number(countRows[0]?.totalItems ?? 0);
    const transactions = rawTransactions.map((transaction) => ({
      ...transaction,
      referenceId: transaction.referenceId ?? undefined,
    }));

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      transactions,
    };
  }
}
