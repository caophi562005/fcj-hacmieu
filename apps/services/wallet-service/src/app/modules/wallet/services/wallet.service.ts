import {
  AdjustWalletRequest,
  GetMyTransactionsRequest,
  GetMyTransactionsResponse,
  GetMyWalletRequest,
  WalletResponse,
} from '@common/interfaces/models/wallet';
import { Injectable } from '@nestjs/common';
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
    return this.walletRepository.adjust(data);
  }

  async getMyTransactions({
    processId: _,
    ...data
  }: GetMyTransactionsRequest): Promise<GetMyTransactionsResponse> {
    return this.walletRepository.listTransactions(data);
  }
}
