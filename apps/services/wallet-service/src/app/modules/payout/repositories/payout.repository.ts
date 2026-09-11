import { PaginationConfiguration } from '@common/configurations/pagination.config';
import {
  CreditTransactionSourceValues,
  CreditTransactionTypeValues,
} from '@common/constants/credit.constant';
import {
  PayoutStatusType,
  PayoutStatusValues,
} from '@common/constants/payout.constant';
import type {
  CreateShopPayoutRequest,
  DeleteShopPayoutRequest,
  GetShopPayoutByIdRequest,
  GetShopPayoutsRequest,
  GetShopPayoutsResponse,
  ShopPayoutResponse,
  UpdateShopPayoutStatusRequest,
} from '@common/interfaces/models/wallet';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma-client/wallet-service';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PayoutRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateShopPayoutRequest): Promise<ShopPayoutResponse> {
    const payoutId = randomUUID();
    try {
      await this.prismaService.$queryRaw`
        CALL sp_create_payout_request(
          ${payoutId}, ${data.shopId}, ${data.amount}, ${data.bankName},
          ${data.accountNumber}, ${data.accountHolder}, ${data.note ?? null}
        )
      `;
    } catch (error) {
      if (String(error).includes('CREDIT_INSUFFICIENT_BALANCE')) {
        throw new BadRequestException('Error.CreditInsufficientBalance');
      }
      if (String(error).includes('CREDIT_NOT_FOUND')) {
        throw new NotFoundException('Error.CreditNotFound');
      }
      throw error;
    }

    return this.prismaService.payoutRequest.findUniqueOrThrow({
      where: { id: payoutId },
    });
  }

  async getById(data: GetShopPayoutByIdRequest): Promise<ShopPayoutResponse> {
    const payout = await this.prismaService.payoutRequest.findFirst({
      where: {
        id: data.payoutId,
        shopId: data.shopId,
      },
    });

    if (!payout) {
      throw new NotFoundException('Error.PayoutNotFound');
    }

    return payout;
  }

  async list(data: GetShopPayoutsRequest): Promise<GetShopPayoutsResponse> {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const where = {
      shopId: data.shopId || undefined,
    } as {
      shopId?: string;
      status?: PayoutStatusType;
    };
    if (data.status) {
      where.status = data.status;
    }

    if (where.status === PayoutStatusValues.PENDING) {
      const filters = [Prisma.sql`status = 'PENDING'`];
      if (where.shopId) filters.push(Prisma.sql`shopId = ${where.shopId}`);
      const sqlWhere = Prisma.join(filters, ' AND ');
      const [payouts, countRows] = await Promise.all([
        this.prismaService.$queryRaw<ShopPayoutResponse[]>(Prisma.sql`
          SELECT * FROM vw_pending_payouts
           WHERE ${sqlWhere}
           ORDER BY createdAt DESC
           LIMIT ${limit} OFFSET ${skip}
        `),
        this.prismaService.$queryRaw<Array<{ totalItems: bigint | number }>>(
          Prisma.sql`
            SELECT COUNT(*) AS totalItems
              FROM vw_pending_payouts
             WHERE ${sqlWhere}
          `,
        ),
      ]);
      const totalItems = Number(countRows[0]?.totalItems ?? 0);
      return {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        payouts,
      };
    }

    const [payouts, totalItems] = await Promise.all([
      this.prismaService.payoutRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.payoutRequest.count({ where }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      payouts,
    };
  }

  async updateStatus(
    data: UpdateShopPayoutStatusRequest,
  ): Promise<ShopPayoutResponse> {
    return this.prismaService.$transaction(async (tx) => {
      const payout = await tx.payoutRequest.findFirst({
        where: {
          id: data.payoutId,
          shopId: data.shopId,
        },
      });

      if (!payout) {
        throw new NotFoundException('Error.PayoutNotFound');
      }

      if (payout.status !== PayoutStatusValues.PENDING) {
        throw new BadRequestException('Error.PayoutAlreadyProcessed');
      }

      if (data.status === PayoutStatusValues.PENDING) {
        throw new BadRequestException('Error.PayoutInvalidStatusTransition');
      }

      if (
        data.status === PayoutStatusValues.REJECTED &&
        !data.rejectReason?.trim()
      ) {
        throw new BadRequestException('Error.PayoutRejectReasonRequired');
      }

      const updated = await tx.payoutRequest.update({
        where: { id: payout.id },
        data: {
          status: data.status,
          rejectReason:
            data.status === PayoutStatusValues.REJECTED
              ? (data.rejectReason?.trim() ?? null)
              : null,
          processedAt: new Date(),
        },
      });

      if (updated.status === PayoutStatusValues.REJECTED) {
        await this.refundPayout(tx, updated);
      }

      return updated;
    });
  }

  async delete(data: DeleteShopPayoutRequest): Promise<ShopPayoutResponse> {
    return this.prismaService.$transaction(async (tx) => {
      const payout = await tx.payoutRequest.findFirst({
        where: {
          id: data.payoutId,
          shopId: data.shopId,
        },
      });

      if (!payout) {
        throw new NotFoundException('Error.PayoutNotFound');
      }

      if (payout.status !== PayoutStatusValues.PENDING) {
        throw new BadRequestException('Error.PayoutAlreadyProcessed');
      }

      const deleted = await tx.payoutRequest.delete({
        where: { id: payout.id },
      });

      await this.refundPayout(tx, deleted);

      return deleted;
    });
  }

  private async refundPayout(
    tx: {
      credit: {
        findUnique: (...args: any[]) => Promise<any>;
        update: (...args: any[]) => Promise<any>;
      };
      creditTransaction: {
        create: (...args: any[]) => Promise<any>;
      };
    },
    payout: ShopPayoutResponse,
  ) {
    const credit = await tx.credit.findUnique({
      where: { id: payout.creditId },
    });

    if (!credit) {
      throw new NotFoundException('Error.CreditNotFound');
    }

    const newBalance = credit.balance + payout.amount;

    const updateCredit$ = tx.credit.update({
      where: { id: credit.id },
      data: { balance: newBalance },
    });

    const creditTransaction$ = tx.creditTransaction.create({
      data: {
        creditId: credit.id,
        shopId: payout.shopId,
        type: CreditTransactionTypeValues.CREDIT,
        source: CreditTransactionSourceValues.REFUND,
        referenceId: payout.id,
        amount: payout.amount,
        balanceAfter: newBalance,
        description: `Hoàn tiền yêu cầu rút #${payout.id.slice(-8).toUpperCase()}`,
      },
    });

    await Promise.all([updateCredit$, creditTransaction$]);
  }
}
