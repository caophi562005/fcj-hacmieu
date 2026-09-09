import {
  GetMarketingPreferencesRequest,
  IAM_SERVICE_PACKAGE_NAME,
  MARKETING_PREFERENCE_MODULE_SERVICE_NAME,
  MarketingPreferenceModuleClient,
  UnsubscribeMarketingRequest,
  UpdateMarketingPreferencesRequest,
} from '@common/interfaces/proto-types/iam';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketingPreferenceService implements OnModuleInit {
  private client!: MarketingPreferenceModuleClient;

  constructor(
    @Inject(IAM_SERVICE_PACKAGE_NAME) private readonly iamClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.client = this.iamClient.getService<MarketingPreferenceModuleClient>(
      MARKETING_PREFERENCE_MODULE_SERVICE_NAME,
    );
  }

  get(data: GetMarketingPreferencesRequest) {
    return firstValueFrom(this.client.getMarketingPreferences(data));
  }

  update(data: UpdateMarketingPreferencesRequest) {
    return firstValueFrom(this.client.updateMarketingPreferences(data));
  }

  unsubscribe(data: UnsubscribeMarketingRequest) {
    return firstValueFrom(this.client.unsubscribeMarketing(data));
  }
}
