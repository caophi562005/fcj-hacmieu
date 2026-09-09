import {
  GetMarketingRecipientsRequest,
  GetMarketingRecipientsResponse,
  IAM_SERVICE_PACKAGE_NAME,
  MARKETING_PREFERENCE_MODULE_SERVICE_NAME,
  MarketingPreferenceModuleClient,
} from '@common/interfaces/proto-types/iam';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketingRecipientService implements OnModuleInit {
  private client!: MarketingPreferenceModuleClient;

  constructor(
    @Inject(IAM_SERVICE_PACKAGE_NAME) private readonly iamClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.client = this.iamClient.getService<MarketingPreferenceModuleClient>(
      MARKETING_PREFERENCE_MODULE_SERVICE_NAME,
    );
  }

  list(
    data: GetMarketingRecipientsRequest,
  ): Promise<GetMarketingRecipientsResponse> {
    return firstValueFrom(
      this.client.getMarketingRecipients({
        ...data,
        userIds: data.userIds ?? [],
      }),
    );
  }
}
