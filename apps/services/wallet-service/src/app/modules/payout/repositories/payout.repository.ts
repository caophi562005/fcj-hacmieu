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
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PayoutRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateShopPayoutRequest): Promise<ShopPayoutResponse> {
    return this.prismaService.$transaction(async (tx) => {
      const credit = await tx.credit.upsert({
        where: { shopId: data.shopId },
        update: {},
        create: { shopId: data.shopId, balance: 0 },
      });

      if (credit.balance < data.amount) {
        throw new BadRequestException('Error.CreditInsufficientBalance');
      }

      const payout = await tx.payoutRequest.create({
        data: {
          creditId: credit.id,
          shopId: data.shopId,
          amount: data.amount,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountHolder: data.accountHolder,
          note: data.note ?? null,
          status: PayoutStatusValues.PENDING,
        },
      });

      const newBalance = credit.balance - data.amount;

      const updateCredit$ = tx.credit.update({
        where: { id: credit.id },
        data: { balance: newBalance },
      });

      const creditTransaction$ = tx.creditTransaction.create({
        data: {
          creditId: credit.id,
          shopId: data.shopId,
          type: CreditTransactionTypeValues.DEBIT,
          source: CreditTransactionSourceValues.WITHDRAWAL,
          referenceId: payout.id,
          amount: data.amount,
          balanceAfter: newBalance,
          description: `Tạo yêu cầu rút tiền #${payout.id.slice(-8).toUpperCase()}`,
        },
      });

      await Promise.all([updateCredit$, creditTransaction$]);

      return payout;
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
