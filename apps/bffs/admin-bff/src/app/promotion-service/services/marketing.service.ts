import {
  CreateMarketingCampaignRequest,
  DispatchMarketingCampaignRequest,
  GetManyMarketingCampaignsRequest,
  GetMarketingCampaignRequest,
  MARKETING_MODULE_SERVICE_NAME,
  MarketingModuleClient,
  PROMOTION_SERVICE_PACKAGE_NAME,
  RecordMarketingWebhookRequest,
  ScanMarketingRequest,
} from '@common/interfaces/proto-types/promotion';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketingService implements OnModuleInit {
  private client!: MarketingModuleClient;

  constructor(
    @Inject(PROMOTION_SERVICE_PACKAGE_NAME)
    private readonly promotionClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.client = this.promotionClient.getService<MarketingModuleClient>(
      MARKETING_MODULE_SERVICE_NAME,
    );
  }

  list(data: GetManyMarketingCampaignsRequest) {
    return firstValueFrom(this.client.getManyMarketingCampaigns(data));
  }

  find(data: GetMarketingCampaignRequest) {
    return firstValueFrom(this.client.getMarketingCampaign(data));
  }

  create(data: CreateMarketingCampaignRequest) {
    return firstValueFrom(this.client.createMarketingCampaign(data));
  }

  dispatch(data: DispatchMarketingCampaignRequest) {
    return firstValueFrom(this.client.dispatchMarketingCampaign(data));
  }

  scan(data: ScanMarketingRequest) {
    return firstValueFrom(this.client.scanMarketing(data));
  }

  webhook(data: RecordMarketingWebhookRequest) {
    return firstValueFrom(this.client.recordMarketingWebhook(data));
  }
}
