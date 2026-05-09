import {
  AdjustShopCreditRequest,
  CREDIT_MODULE_SERVICE_NAME,
  CreditModuleClient,
  CreditResponse,
  GetShopCreditRequest,
  GetShopCreditTransactionsRequest,
  GetShopCreditTransactionsResponse,
  GetShopRevenueSummaryRequest,
  GetShopRevenueSummaryResponse,
  WALLET_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/wallet';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CreditService implements OnModuleInit {
  private creditModule!: CreditModuleClient;

  constructor(
    @Inject(WALLET_SERVICE_PACKAGE_NAME)
    private readonly walletClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.creditModule = this.walletClient.getService<CreditModuleClient>(
      CREDIT_MODULE_SERVICE_NAME,
    );
  }

  async getShopCredit(data: GetShopCreditRequest): Promise<CreditResponse> {
    return firstValueFrom(this.creditModule.getShopCredit(data));
  }

  async adjustShopCredit(
    data: AdjustShopCreditRequest,
  ): Promise<CreditResponse> {
    return firstValueFrom(this.creditModule.adjustShopCredit(data));
  }

  async getShopCreditTransactions(
    data: GetShopCreditTransactionsRequest,
  ): Promise<GetShopCreditTransactionsResponse> {
    return firstValueFrom(this.creditModule.getShopCreditTransactions(data));
  }

  async getShopRevenueSummary(
    data: GetShopRevenueSummaryRequest,
  ): Promise<GetShopRevenueSummaryResponse> {
    return firstValueFrom(this.creditModule.getShopRevenueSummary(data));
  }
}
