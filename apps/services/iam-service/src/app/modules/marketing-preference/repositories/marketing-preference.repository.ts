import { MarketingTopicValues } from '@common/constants/user.constant';
import {
  GetMarketingRecipientsRequest,
  UnsubscribeMarketingRequest,
  UpdateMarketingPreferencesRequest,
} from '@common/interfaces/models/iam';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MarketingPreferenceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  listByUser(userId: string) {
    return this.prismaService.marketingPreference.findMany({
      where: { userId },
    });
  }

  async update(data: UpdateMarketingPreferencesRequest) {
    const now = new Date();
    const topics = [
      {
        topic: MarketingTopicValues.PROMOTION_OFFERS,
        optedIn: data.promotionOffers,
      },
      {
        topic: MarketingTopicValues.VOUCHER_REMINDERS,
        optedIn: data.voucherReminders,
      },
    ] as const;

    await this.prismaService.$transaction(
      topics.map(({ topic, optedIn }) =>
        this.prismaService.marketingPreference.upsert({
          where: { userId_topic: { userId: data.userId, topic } },
          create: {
            userId: data.userId,
            topic,
            optedIn,
            consentSource: data.consentSource,
            consentVersion: data.consentVersion,
            consentedAt: optedIn ? now : null,
            withdrawnAt: optedIn ? null : now,
          },
          update: {
            optedIn,
            consentSource: data.consentSource,
            consentVersion: data.consentVersion,
            consentedAt: optedIn ? now : undefined,
            withdrawnAt: optedIn ? null : now,
          },
        }),
      ),
    );
  }

  async listRecipients(data: GetMarketingRecipientsRequest) {
    const page = data.page || 1;
    const limit = data.limit || 100;
    // proto-loader omits an empty repeated field unless array defaults are
    // enabled, so userIds can be undefined at runtime despite the TS type.
    const userIds = data.userIds ?? [];
    const where = {
      deletedAt: null,
      status: 'ACTIVE' as const,
      group: { has: 'CUSTOMER' as const },
      id: userIds.length ? { in: userIds } : undefined,
      marketingPreferences: {
        some: { topic: data.topic, optedIn: true },
      },
    };

    const [totalItems, users] = await Promise.all([
      this.prismaService.user.count({ where }),
      this.prismaService.user.findMany({
        where,
        select: { id: true, email: true, username: true },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      recipients: users.map((user) => ({
        userId: user.id,
        email: user.email,
        username: user.username,
      })),
    };
  }

  async unsubscribe(data: UnsubscribeMarketingRequest) {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (!user) return null;

    await this.prismaService.marketingPreference.upsert({
      where: { userId_topic: { userId: user.id, topic: data.topic } },
      create: {
        userId: user.id,
        topic: data.topic,
        optedIn: false,
        consentSource: 'EMAIL_UNSUBSCRIBE',
        withdrawnAt: new Date(),
      },
      update: {
        optedIn: false,
        consentSource: 'EMAIL_UNSUBSCRIBE',
        withdrawnAt: new Date(),
      },
    });
    return user.id;
  }
}
