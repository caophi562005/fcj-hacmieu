import {
  ClaimPromotionRequest,
  GetMyVouchersRequest,
  GetMyVouchersResponse,
  PromotionRedemptionResponse,
  REDEMPTION_MODULE_SERVICE_NAME,
  PROMOTION_SERVICE_PACKAGE_NAME,
  RedemptionModuleClient,
} from '@common/interfaces/proto-types/promotion';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RedemptionService implements OnModuleInit {
  private redemptionModule!: RedemptionModuleClient;

  constructor(
    @Inject(PROMOTION_SERVICE_PACKAGE_NAME)
    private readonly promotionClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.redemptionModule =
      this.promotionClient.getService<RedemptionModuleClient>(
        REDEMPTION_MODULE_SERVICE_NAME,
      );
  }

  async claimPromotion(
    data: ClaimPromotionRequest,
  ): Promise<PromotionRedemptionResponse> {
    return firstValueFrom(this.redemptionModule.claimPromotion(data));
  }

  async getMyVouchers(
    data: GetMyVouchersRequest,
  ): Promise<GetMyVouchersResponse> {
    return firstValueFrom(this.redemptionModule.getMyVouchers(data));
  }
}
