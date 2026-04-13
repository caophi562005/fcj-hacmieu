import {
  CheckPromotionRequest,
  CreatePromotionRequest,
  DeletePromotionRequest,
  GetManyPromotionsRequest,
  GetManyPromotionsResponse,
  GetPromotionRequest,
  PROMOTION_SERVICE_NAME,
  PROMOTION_SERVICE_PACKAGE_NAME,
  PromotionResponse,
  PromotionServiceClient,
  UpdatePromotionRequest,
} from '@common/interfaces/proto-types/promotion';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PromotionService implements OnModuleInit {
  private promotionService!: PromotionServiceClient;

  constructor(
    @Inject(PROMOTION_SERVICE_PACKAGE_NAME)
    private readonly promotionClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.promotionService =
      this.promotionClient.getService<PromotionServiceClient>(
        PROMOTION_SERVICE_NAME,
      );
  }

  async getManyPromotions(
    data: GetManyPromotionsRequest,
  ): Promise<GetManyPromotionsResponse> {
    return firstValueFrom(this.promotionService.getManyPromotions(data));
  }

  async getPromotion(data: GetPromotionRequest): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionService.getPromotion(data));
  }

  async createPromotion(
    data: CreatePromotionRequest,
  ): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionService.createPromotion(data));
  }

  async updatePromotion(
    data: UpdatePromotionRequest,
  ): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionService.updatePromotion(data));
  }

  async deletePromotion(
    data: DeletePromotionRequest,
  ): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionService.deletePromotion(data));
  }

  async checkPromotion(
    data: CheckPromotionRequest,
  ): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionService.checkPromotion(data));
  }
}
