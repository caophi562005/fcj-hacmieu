import {
  GetPlatformLedgerListRequest,
  GetPlatformRevenueSummaryRequest,
  RecordPlatformLedgerRequest,
} from '@common/interfaces/proto-types/wallet';
import { Injectable } from '@nestjs/common';
import {
  PlatformLedgerRepository,
  RecordPlatformLedgerData,
} from '../repositories/platform-ledger.repository';

@Injectable()
export class PlatformLedgerService {
  constructor(
    private readonly platformLedgerRepository: PlatformLedgerRepository,
  ) {}

  async recordPlatformLedger(data: RecordPlatformLedgerRequest) {
    const payload: RecordPlatformLedgerData = {
      orderId: data.orderId,
      shopId: data.shopId,
      grossAmount: data.grossAmount,
      commissionRate: data.commissionRate,
      commissionFee: data.commissionFee,
      taxRate: data.taxRate,
      taxWithheld: data.taxWithheld,
      netSellerAmount: data.netSellerAmount,
    };

    const res = await this.platformLedgerRepository.create(payload);
    return {
      ...res,
      createdAt: res.createdAt.toISOString(),
    };
  }

  async getPlatformRevenueSummary(data: GetPlatformRevenueSummaryRequest) {
    const summary = await this.platformLedgerRepository.getSummary({
      shopId: data.shopId || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
    });

    return summary;
  }

  async getPlatformLedgerList(data: GetPlatformLedgerListRequest) {
    const res = await this.platformLedgerRepository.list({
      page: data.page || 1,
      limit: data.limit || 10,
      shopId: data.shopId || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      sortBy: (data.sortBy as 'createdAt' | 'grossAmount' | 'commissionFee') || 'createdAt',
      sortOrder: (data.sortOrder as 'asc' | 'desc') || 'desc',
    });

    return {
      page: res.page,
      limit: res.limit,
      totalItems: res.totalItems,
      totalPages: res.totalPages,
      items: res.items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }
}
