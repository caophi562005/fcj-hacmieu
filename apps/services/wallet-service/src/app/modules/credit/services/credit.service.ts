import {
  AdjustShopCreditRequest,
  CreditResponse,
  GetShopCreditRequest,
  GetShopCreditTransactionsRequest,
  GetShopCreditTransactionsResponse,
} from '@common/interfaces/models/wallet';
import { Injectable } from '@nestjs/common';
import { CreditRepository } from '../repositories/credit.repository';

@Injectable()
export class CreditService {
  constructor(private readonly creditRepository: CreditRepository) {}

  async getShopCredit({ shopId }: GetShopCreditRequest): Promise<CreditResponse> {
    return this.creditRepository.upsert(shopId);
  }

  async adjustShopCredit({
    processId: _,
    ...data
  }: AdjustShopCreditRequest): Promise<CreditResponse> {
    return this.creditRepository.adjust(data);
  }

  async getShopCreditTransactions({
    processId: _,
    ...data
  }: GetShopCreditTransactionsRequest): Promise<GetShopCreditTransactionsResponse> {
    return this.creditRepository.listTransactions(data);
  }
}
