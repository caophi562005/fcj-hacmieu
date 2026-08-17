import {
  CreditTransactionSourceValues,
  CreditTransactionTypeValues,
} from '@common/constants/credit.constant';
import {
  SellerSettlementActionValues,
  SellerSettlementStatusType,
} from '@common/constants/settlement.constant';
import {
  CreateSellerSettlementRequest,
  GetSellerSettlementByIdRequest,
  GetSellerSettlementsRequest,
  UpdateSellerSettlementStatusRequest,
} from '@common/interfaces/models/wallet';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  SellerSettlementStatus,
} from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

const SETTLEMENT_DELAY_MS = 3 * 24 * 60 * 60 * 1000;
const PROCESSING_LEASE_MS = 5 * 60 * 1000;

@Injectable()
export class SellerSettlementRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateSellerSettlementRequest) {
    const completedAt = new Date(data.completedAt);
    const availableAt = new Date(completedAt.getTime() + SETTLEMENT_DELAY_MS);

    return this.prismaService.sellerSettlement.upsert({
      where: { orderId: data.orderId },
      update: {},
      create: {
        orderId: data.orderId,
        shopId: data.shopId,
        grossAmount: data.grossAmount,
        commissionRate: data.commissionRate,
        commissionFee: data.commissionFee,
        taxRate: data.taxRate,
        taxWithheld: data.taxWithheld,
        netSellerAmount: data.netSellerAmount,
        completedAt,
        availableAt,
      },
    });
  }

  async claimDue(batchSize: number) {
    const now = new Date();
    const leaseExpiredAt = new Date(now.getTime() - PROCESSING_LEASE_MS);

    await this.prismaService.sellerSettlement.updateMany({
      where: {
        status: SellerSettlementStatus.PROCESSING,
        processingStartedAt: { lt: leaseExpiredAt },
      },
      data: {
        status: SellerSettlementStatus.PENDING,
        processingStartedAt: null,
        lastError: 'Processing lease expired; settlement queued for retry.',
      },
    });

    const candidates = await this.prismaService.sellerSettlement.findMany({
      where: {
        status: {
          in: [SellerSettlementStatus.PENDING, SellerSettlementStatus.FAILED],
        },
        availableAt: { lte: now },
      },
      orderBy: { availableAt: 'asc' },
      take: batchSize,
      select: { id: true },
    });

    const claimed: string[] = [];
    for (const candidate of candidates) {
      const result = await this.prismaService.sellerSettlement.updateMany({
        where: {
          id: candidate.id,
          status: {
            in: [SellerSettlementStatus.PENDING, SellerSettlementStatus.FAILED],
          },
          availableAt: { lte: now },
        },
        data: {
          status: SellerSettlementStatus.PROCESSING,
          processingStartedAt: now,
          attemptCount: { increment: 1 },
          lastError: null,
        },
      });
      if (result.count === 1) claimed.push(candidate.id);
    }

    return claimed;
  }

  async settle(id: string) {
    return this.prismaService.$transaction(
      async (tx) => {
        const settlement = await tx.sellerSettlement.findUnique({
          where: { id },
        });
        if (
          !settlement ||
          settlement.status !== SellerSettlementStatus.PROCESSING
        )
          return;

        // Write the settlement row inside a serializable transaction. A concurrent
        // admin HOLD/CANCEL updates this same row, so only one operation can commit.
        await tx.sellerSettlement.update({
          where: { id: settlement.id },
          data: { version: { increment: 1 } },
        });

        const credit = await tx.credit.upsert({
          where: { shopId: settlement.shopId },
          update: {},
          create: { shopId: settlement.shopId, balance: 0 },
        });

        const existing = await tx.creditTransaction.findUnique({
          where: {
            shopId_source_referenceId: {
              shopId: settlement.shopId,
              source: CreditTransactionSourceValues.ORDER_REVENUE,
              referenceId: settlement.orderId,
            },
          },
          select: { id: true },
        });

        if (!existing) {
          const updatedCredit = await tx.credit.update({
            where: { id: credit.id },
            data: { balance: { increment: settlement.netSellerAmount } },
          });
          await tx.creditTransaction.create({
            data: {
              creditId: credit.id,
              shopId: settlement.shopId,
              type: CreditTransactionTypeValues.CREDIT,
              source: CreditTransactionSourceValues.ORDER_REVENUE,
              referenceId: settlement.orderId,
              amount: settlement.netSellerAmount,
              balanceAfter: updatedCredit.balance,
              description: `Doanh thu thực nhận đơn hàng ${settlement.orderId}`,
            },
          });
        }

        await tx.sellerSettlement.update({
          where: { id },
          data: {
            creditId: credit.id,
            status: SellerSettlementStatus.SETTLED,
            settledAt: new Date(),
            processingStartedAt: null,
            lastError: null,
            version: { increment: 1 },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  markFailed(id: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return this.prismaService.sellerSettlement.updateMany({
      where: { id, status: SellerSettlementStatus.PROCESSING },
      data: {
        status: SellerSettlementStatus.FAILED,
        processingStartedAt: null,
        lastError: message.slice(0, 1000),
      },
    });
  }

  async getSummary(shopId?: string) {
    const now = new Date();
    const within24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const scope = shopId ? { shopId } : {};
    const pendingStatuses = [
      SellerSettlementStatus.PENDING,
      SellerSettlementStatus.FAILED,
      SellerSettlementStatus.PROCESSING,
    ];

    const [pending, due, held, failed, settled, next] = await Promise.all([
      this.prismaService.sellerSettlement.aggregate({
        where: { ...scope, status: { in: pendingStatuses } },
        _sum: { netSellerAmount: true },
        _count: true,
      }),
      this.prismaService.sellerSettlement.aggregate({
        where: {
          ...scope,
          status: { in: pendingStatuses },
          availableAt: { lte: within24Hours },
        },
        _sum: { netSellerAmount: true },
        _count: true,
      }),
      this.prismaService.sellerSettlement.aggregate({
        where: { ...scope, status: SellerSettlementStatus.HELD },
        _sum: { netSellerAmount: true },
        _count: true,
      }),
      this.prismaService.sellerSettlement.aggregate({
        where: { ...scope, status: SellerSettlementStatus.FAILED },
        _sum: { netSellerAmount: true },
        _count: true,
      }),
      this.prismaService.sellerSettlement.aggregate({
        where: { ...scope, status: SellerSettlementStatus.SETTLED },
        _sum: { netSellerAmount: true },
        _count: true,
      }),
      this.prismaService.sellerSettlement.findFirst({
        where: { ...scope, status: { in: pendingStatuses } },
        orderBy: { availableAt: 'asc' },
        select: { availableAt: true, netSellerAmount: true },
      }),
    ]);

    return {
      pendingAmount: pending._sum.netSellerAmount ?? 0,
      pendingCount: pending._count,
      dueWithin24HoursAmount: due._sum.netSellerAmount ?? 0,
      dueWithin24HoursCount: due._count,
      heldAmount: held._sum.netSellerAmount ?? 0,
      heldCount: held._count,
      failedAmount: failed._sum.netSellerAmount ?? 0,
      failedCount: failed._count,
      settledAmount: settled._sum.netSellerAmount ?? 0,
      settledCount: settled._count,
      nextAvailableAt: next?.availableAt ?? null,
      nextAvailableAmount: next?.netSellerAmount ?? 0,
    };
  }

  async list(data: GetSellerSettlementsRequest) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const where: Prisma.SellerSettlementWhereInput = {
      shopId: data.shopId,
      id: data.settlementId,
      orderId: data.orderId,
      status: data.status as SellerSettlementStatusType | undefined,
      completedAt:
        data.completedFrom || data.completedTo
          ? {
              gte: data.completedFrom
                ? new Date(data.completedFrom)
                : undefined,
              lte: data.completedTo ? new Date(data.completedTo) : undefined,
            }
          : undefined,
      availableAt:
        data.availableFrom || data.availableTo
          ? {
              gte: data.availableFrom
                ? new Date(data.availableFrom)
                : undefined,
              lte: data.availableTo ? new Date(data.availableTo) : undefined,
            }
          : undefined,
      netSellerAmount:
        data.minAmount !== undefined || data.maxAmount !== undefined
          ? { gte: data.minAmount, lte: data.maxAmount }
          : undefined,
    };
    const orderBy = {
      [data.sortBy || 'availableAt']: data.sortOrder || 'asc',
    } as Prisma.SellerSettlementOrderByWithRelationInput;

    const [settlements, totalItems] = await Promise.all([
      this.prismaService.sellerSettlement.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.sellerSettlement.count({ where }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      settlements,
    };
  }

  async getById(data: GetSellerSettlementByIdRequest) {
    const settlement = await this.prismaService.sellerSettlement.findFirst({
      where: { id: data.settlementId, shopId: data.shopId },
      include: { histories: { orderBy: { createdAt: 'desc' } } },
    });
    if (!settlement) throw new NotFoundException('Error.SettlementNotFound');
    return settlement;
  }

  async updateStatus(data: UpdateSellerSettlementStatusRequest) {
    return this.prismaService.$transaction(
      async (tx) => {
        const current = await tx.sellerSettlement.findUnique({
          where: { id: data.settlementId },
        });
        if (!current) throw new NotFoundException('Error.SettlementNotFound');

        let target: SellerSettlementStatus;
        let allowed: SellerSettlementStatus[];
        if (data.action === SellerSettlementActionValues.HOLD) {
          target = SellerSettlementStatus.HELD;
          allowed = [
            SellerSettlementStatus.PENDING,
            SellerSettlementStatus.FAILED,
            SellerSettlementStatus.PROCESSING,
          ];
        } else if (data.action === SellerSettlementActionValues.RELEASE) {
          target = SellerSettlementStatus.PENDING;
          allowed = [SellerSettlementStatus.HELD];
        } else {
          target = SellerSettlementStatus.CANCELLED;
          allowed = [
            SellerSettlementStatus.PENDING,
            SellerSettlementStatus.FAILED,
            SellerSettlementStatus.PROCESSING,
            SellerSettlementStatus.HELD,
          ];
        }

        if (!allowed.includes(current.status)) {
          throw new BadRequestException(
            'Error.SettlementInvalidStatusTransition',
          );
        }

        const now = new Date();
        const result = await tx.sellerSettlement.updateMany({
          where: {
            id: current.id,
            version: current.version,
            status: { in: allowed },
          },
          data: {
            status: target,
            processingStartedAt: null,
            version: { increment: 1 },
            ...(data.action === SellerSettlementActionValues.HOLD
              ? {
                  heldAt: now,
                  heldBy: data.actorId,
                  holdReason: data.reason,
                }
              : {}),
            ...(data.action === SellerSettlementActionValues.RELEASE
              ? {
                  releasedAt: now,
                  releasedBy: data.actorId,
                  holdReason: null,
                }
              : {}),
            ...(data.action === SellerSettlementActionValues.CANCEL
              ? {
                  cancelledAt: now,
                  cancelledBy: data.actorId,
                  cancelReason: data.reason,
                }
              : {}),
          },
        });
        if (result.count !== 1) {
          throw new BadRequestException('Error.SettlementConcurrentUpdate');
        }

        await tx.sellerSettlementHistory.create({
          data: {
            settlementId: current.id,
            action: data.action,
            fromStatus: current.status,
            toStatus: target,
            reason: data.reason ?? null,
            actorId: data.actorId,
          },
        });

        return tx.sellerSettlement.findUniqueOrThrow({
          where: { id: current.id },
          include: { histories: { orderBy: { createdAt: 'desc' } } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
