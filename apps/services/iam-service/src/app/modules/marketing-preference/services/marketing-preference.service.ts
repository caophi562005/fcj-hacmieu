import { MarketingTopicValues } from '@common/constants/user.constant';
import {
  GetMarketingPreferencesRequest,
  GetMarketingRecipientsRequest,
  MarketingPreferencesResponse,
  UnsubscribeMarketingRequest,
  UpdateMarketingPreferencesRequest,
} from '@common/interfaces/models/iam';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketingPreferenceRepository } from '../repositories/marketing-preference.repository';

@Injectable()
export class MarketingPreferenceService {
  constructor(private readonly repository: MarketingPreferenceRepository) {}

  async get(
    data: GetMarketingPreferencesRequest,
  ): Promise<MarketingPreferencesResponse> {
    const preferences = await this.repository.listByUser(data.userId);
    return this.toResponse(data.userId, preferences);
  }

  async update(
    data: UpdateMarketingPreferencesRequest,
  ): Promise<MarketingPreferencesResponse> {
    await this.repository.update(data);
    return this.get({ userId: data.userId, processId: data.processId });
  }

  listRecipients(data: GetMarketingRecipientsRequest) {
    return this.repository.listRecipients(data);
  }

  async unsubscribe(
    data: UnsubscribeMarketingRequest,
  ): Promise<MarketingPreferencesResponse> {
    const userId = await this.repository.unsubscribe(data);
    if (!userId) throw new NotFoundException('Error.UserNotFound');
    return this.get({ userId, processId: data.processId });
  }

  private toResponse(
    userId: string,
    preferences: Array<{ topic: string; optedIn: boolean }>,
  ): MarketingPreferencesResponse {
    return {
      userId,
      promotionOffers:
        preferences.find(
          (item) => item.topic === MarketingTopicValues.PROMOTION_OFFERS,
        )?.optedIn ?? false,
      voucherReminders:
        preferences.find(
          (item) => item.topic === MarketingTopicValues.VOUCHER_REMINDERS,
        )?.optedIn ?? false,
    };
  }
}
