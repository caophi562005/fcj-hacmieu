import {
  AdjustWalletRequest,
  GetMyTransactionsRequest,
  GetMyTransactionsResponse,
  GetMyWalletRequest,
  WALLET_MODULE_SERVICE_NAME,
  WALLET_SERVICE_PACKAGE_NAME,
  WalletModuleClient,
  WalletResponse,
} from '@common/interfaces/proto-types/wallet';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WalletService implements OnModuleInit {
  private walletModule!: WalletModuleClient;

  constructor(
    @Inject(WALLET_SERVICE_PACKAGE_NAME)
    private readonly walletClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.walletModule = this.walletClient.getService<WalletModuleClient>(
      WALLET_MODULE_SERVICE_NAME,
    );
  }

  async getMyWallet(data: GetMyWalletRequest): Promise<WalletResponse> {
    return firstValueFrom(this.walletModule.getMyWallet(data));
  }

  async adjustWallet(data: AdjustWalletRequest): Promise<WalletResponse> {
    return firstValueFrom(this.walletModule.adjustWallet(data));
  }

  async getMyTransactions(
    data: GetMyTransactionsRequest,
  ): Promise<GetMyTransactionsResponse> {
    return firstValueFrom(this.walletModule.getMyTransactions(data));
  }
}
