import {
  AdjustWalletRequest,
  GetMyTransactionsRequest,
  GetMyTransactionsResponse,
  GetMyWalletRequest,
  WalletResponse,
} from '@common/interfaces/models/wallet';
import { WalletTransactionTypeValues } from '@common/constants/wallet.constant';
import { BadRequestException, Injectable } from '@nestjs/common';
import { WalletRepository } from '../repositories/wallet.repository';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async getMyWallet({ userId }: GetMyWalletRequest): Promise<WalletResponse> {
    return this.walletRepository.upsert(userId);
  }

  async adjustWallet({
    processId: _,
    ...data
  }: AdjustWalletRequest): Promise<WalletResponse> {
    if (!Number.isInteger(data.amount) || data.amount <= 0) {
      throw new BadRequestException('Error.InvalidWalletAmount');
    }
    if (
      data.type !== WalletTransactionTypeValues.CREDIT &&
      data.type !== WalletTransactionTypeValues.DEBIT
    ) {
      throw new BadRequestException('Error.InvalidWalletTransactionType');
    }
    return this.walletRepository.adjust(data);
  }

  async getMyTransactions({
    processId: _,
    ...data
  }: GetMyTransactionsRequest): Promise<GetMyTransactionsResponse> {
    return this.walletRepository.listTransactions(data);
  }
}
