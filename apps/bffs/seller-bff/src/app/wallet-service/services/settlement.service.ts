import {
  GetSellerSettlementByIdRequest,
  GetSellerSettlementSummaryRequest,
  GetSellerSettlementSummaryResponse,
  GetSellerSettlementsRequest,
  GetSellerSettlementsResponse,
  SELLER_SETTLEMENT_MODULE_SERVICE_NAME,
  SellerSettlementDetailResponse,
  SellerSettlementModuleClient,
  WALLET_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/wallet';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SettlementService implements OnModuleInit {
  private module!: SellerSettlementModuleClient;

  constructor(
    @Inject(WALLET_SERVICE_PACKAGE_NAME)
    private readonly walletClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.module = this.walletClient.getService<SellerSettlementModuleClient>(
      SELLER_SETTLEMENT_MODULE_SERVICE_NAME,
    );
  }

  getSummary(
    data: GetSellerSettlementSummaryRequest,
  ): Promise<GetSellerSettlementSummaryResponse> {
    return firstValueFrom(this.module.getSellerSettlementSummary(data));
  }

  getMany(
    data: GetSellerSettlementsRequest,
  ): Promise<GetSellerSettlementsResponse> {
    return firstValueFrom(this.module.getSellerSettlements(data));
  }

  getById(
    data: GetSellerSettlementByIdRequest,
  ): Promise<SellerSettlementDetailResponse> {
    return firstValueFrom(this.module.getSellerSettlementById(data));
  }
}
