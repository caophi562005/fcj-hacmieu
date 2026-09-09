import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateMarketingCampaignRequest,
  DispatchMarketingCampaignRequest,
  GetManyMarketingCampaignsRequest,
  GetMarketingCampaignRequest,
  ProcessMarketingDeliveryRequest,
  RecordMarketingWebhookRequest,
  ScanMarketingRequest,
} from '@common/interfaces/models/promotion';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MarketingService } from '../services/marketing.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class MarketingGrpcController {
  constructor(private readonly service: MarketingService) {}

  @GrpcMethod(GrpcModuleName.PROMOTION.MARKETING, 'GetManyMarketingCampaigns')
  list(data: GetManyMarketingCampaignsRequest) {
    return this.service.list(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.MARKETING, 'GetMarketingCampaign')
  find(data: GetMarketingCampaignRequest) {
    return this.service.find(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.MARKETING, 'CreateMarketingCampaign')
  create(data: CreateMarketingCampaignRequest) {
    return this.service.create(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.MARKETING, 'DispatchMarketingCampaign')
  dispatch(data: DispatchMarketingCampaignRequest) {
    return this.service.dispatch(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.MARKETING, 'ScanMarketing')
  scan(data: ScanMarketingRequest) {
    return this.service.scan(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.MARKETING, 'ProcessMarketingDelivery')
  process(data: ProcessMarketingDeliveryRequest) {
    return this.service.processDelivery(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.MARKETING, 'RecordMarketingWebhook')
  webhook(data: RecordMarketingWebhookRequest) {
    return this.service.recordWebhook(data);
  }
}
