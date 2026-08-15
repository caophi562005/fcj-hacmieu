import {
  GetPlatformLedgerListRequest,
  GetPlatformLedgerListResponse,
  GetPlatformRevenueSummaryRequest,
  GetPlatformRevenueSummaryResponse,
  PLATFORM_LEDGER_MODULE_SERVICE_NAME,
  PlatformLedgerModuleClient,
  WALLET_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/wallet';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PlatformLedgerService implements OnModuleInit {
  private platformLedgerModule!: PlatformLedgerModuleClient;

  constructor(
    @Inject(WALLET_SERVICE_PACKAGE_NAME)
    private readonly walletClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.platformLedgerModule =
      this.walletClient.getService<PlatformLedgerModuleClient>(
        PLATFORM_LEDGER_MODULE_SERVICE_NAME,
      );
  }

  async getPlatformRevenueSummary(
    data: GetPlatformRevenueSummaryRequest,
  ): Promise<GetPlatformRevenueSummaryResponse> {
    return firstValueFrom(
      this.platformLedgerModule.getPlatformRevenueSummary(data),
    );
  }

  async getPlatformLedgerList(
    data: GetPlatformLedgerListRequest,
  ): Promise<GetPlatformLedgerListResponse> {
    return firstValueFrom(
      this.platformLedgerModule.getPlatformLedgerList(data),
    );
  }
}
