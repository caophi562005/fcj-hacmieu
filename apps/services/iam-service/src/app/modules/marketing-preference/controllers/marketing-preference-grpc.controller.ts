import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  GetMarketingPreferencesRequest,
  GetMarketingRecipientsRequest,
  UnsubscribeMarketingRequest,
  UpdateMarketingPreferencesRequest,
} from '@common/interfaces/models/iam';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MarketingPreferenceService } from '../services/marketing-preference.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class MarketingPreferenceGrpcController {
  constructor(private readonly service: MarketingPreferenceService) {}

  @GrpcMethod(
    GrpcModuleName.IAM.MARKETING_PREFERENCE,
    'GetMarketingPreferences',
  )
  get(data: GetMarketingPreferencesRequest) {
    return this.service.get(data);
  }

  @GrpcMethod(
    GrpcModuleName.IAM.MARKETING_PREFERENCE,
    'UpdateMarketingPreferences',
  )
  update(data: UpdateMarketingPreferencesRequest) {
    return this.service.update(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.MARKETING_PREFERENCE, 'GetMarketingRecipients')
  listRecipients(data: GetMarketingRecipientsRequest) {
    return this.service.listRecipients(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.MARKETING_PREFERENCE, 'UnsubscribeMarketing')
  unsubscribe(data: UnsubscribeMarketingRequest) {
    return this.service.unsubscribe(data);
  }
}
