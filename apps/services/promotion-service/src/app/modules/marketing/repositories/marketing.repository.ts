import {
  CreateMarketingCampaignRequest,
  GetManyMarketingCampaignsRequest,
} from '@common/interfaces/models/promotion';
import { Injectable } from '@nestjs/common';
import {
  MarketingDeliveryStatus,
  MarketingDeliveryType,
  Prisma,
} from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

export type NewMarketingDelivery = {
  type: MarketingDeliveryType;
  dedupeKey: string;
  campaignId?: string;
  promotionId: string;
  redemptionId?: string;
  userId: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
};

@Injectable()
export class MarketingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async listCampaigns(data: GetManyMarketingCampaignsRequest) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const where: Prisma.MarketingCampaignWhereInput = {
      status: data.status,
    };
    const [totalItems, campaigns] = await Promise.all([
      this.prismaService.marketingCampaign.count({ where }),
      this.prismaService.marketingCampaign.findMany({
        where,
        include: { promotion: { select: { code: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      campaigns,
    };
  }

  findCampaign(id: string) {
    return this.prismaService.marketingCampaign.findUnique({
      where: { id },
      include: { promotion: true },
    });
  }

  findPromotion(id: string) {
    return this.prismaService.promotion.findFirst({
      where: { id, deletedAt: null },
    });
  }

  createCampaign(data: CreateMarketingCampaignRequest) {
    return this.prismaService.marketingCampaign.create({
      data: {
        name: data.name,
        promotionId: data.promotionId,
        subject: data.subject,
        preheader: data.preheader || null,
        introContent: data.introContent,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        createdById: data.createdById,
      },
      include: { promotion: true },
    });
  }

  markCampaignProcessing(id: string) {
    return this.prismaService.marketingCampaign.update({
      where: { id },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });
  }

  markCampaignQueued(id: string, recipientCount: number) {
    return this.prismaService.marketingCampaign.update({
      where: { id },
      data: {
        recipientCount,
        status: recipientCount === 0 ? 'COMPLETED' : 'PROCESSING',
        completedAt: recipientCount === 0 ? new Date() : null,
      },
    });
  }

  markCampaignFailed(id: string) {
    return this.prismaService.marketingCampaign.update({
      where: { id },
      data: { status: 'FAILED' },
    });
  }

  findDueCampaigns(now: Date) {
    return this.prismaService.marketingCampaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
      },
      select: { id: true },
      take: 50,
    });
  }

  findExpiringRedemptions(now: Date, deadline: Date) {
    return this.prismaService.redemption.findMany({
      where: {
        usedAt: null,
        cancelledAt: null,
        promotion: {
          status: 'ACTIVE',
          deletedAt: null,
          endsAt: { gt: now, lte: deadline },
        },
      },
      include: { promotion: true },
      orderBy: { promotion: { endsAt: 'asc' } },
      take: 500,
    });
  }

  async createDeliveries(items: NewMarketingDelivery[]) {
    const deliveries = [];
    for (const item of items) {
      const delivery = await this.prismaService.marketingDelivery.upsert({
        where: { dedupeKey: item.dedupeKey },
        create: item,
        update: {},
      });
      if (delivery.status === 'QUEUED' || delivery.status === 'FAILED') {
        deliveries.push(delivery);
      }
    }
    return deliveries;
  }

  getDelivery(id: string) {
    return this.prismaService.marketingDelivery.findUnique({ where: { id } });
  }

  async claimDelivery(id: string) {
    const claimed = await this.prismaService.marketingDelivery.updateMany({
      where: { id, status: { in: ['QUEUED', 'FAILED'] } },
      data: { status: 'PROCESSING', attemptCount: { increment: 1 } },
    });
    return claimed.count === 1;
  }

  async markDeliverySent(id: string, providerMessageId: string) {
    const delivery = await this.prismaService.marketingDelivery.update({
      where: { id },
      data: {
        status: 'SENT',
        providerMessageId,
        sentAt: new Date(),
        errorMessage: null,
      },
    });
    if (delivery.campaignId) {
      await this.prismaService.marketingCampaign.update({
        where: { id: delivery.campaignId },
        data: { sentCount: { increment: 1 } },
      });
      await this.completeCampaignIfFinished(delivery.campaignId);
    }
    return delivery;
  }

  async markDeliveryFailed(id: string, message: string) {
    const delivery = await this.prismaService.marketingDelivery.update({
      where: { id },
      data: { status: 'FAILED', errorMessage: message.slice(0, 2000) },
    });
    if (delivery.campaignId) {
      await this.completeCampaignIfFinished(delivery.campaignId);
    }
    return delivery;
  }

  async recordProviderEvent(input: {
    providerEventId: string;
    providerMessageId: string;
    type: string;
    payload: Prisma.InputJsonValue;
    status?: MarketingDeliveryStatus;
    timestampField?:
      | 'deliveredAt'
      | 'openedAt'
      | 'clickedAt'
      | 'bouncedAt'
      | 'complainedAt';
    campaignCounter?:
      | 'deliveredCount'
      | 'openedCount'
      | 'clickedCount'
      | 'bouncedCount'
      | 'complainedCount';
  }) {
    return this.prismaService.$transaction(async (tx) => {
      const duplicate = await tx.marketingEvent.findUnique({
        where: { providerEventId: input.providerEventId },
      });
      if (duplicate) return false;

      const delivery = await tx.marketingDelivery.findUnique({
        where: { providerMessageId: input.providerMessageId },
      });
      await tx.marketingEvent.create({
        data: {
          providerEventId: input.providerEventId,
          deliveryId: delivery?.id,
          type: input.type,
          payload: input.payload,
        },
      });
      if (!delivery || !input.status || !input.timestampField) return true;

      const firstForMetric = delivery[input.timestampField] == null;
      await tx.marketingDelivery.update({
        where: { id: delivery.id },
        data: {
          status: input.status,
          [input.timestampField]: new Date(),
        },
      });
      if (firstForMetric && delivery.campaignId && input.campaignCounter) {
        await tx.marketingCampaign.update({
          where: { id: delivery.campaignId },
          data: { [input.campaignCounter]: { increment: 1 } },
        });
      }
      return true;
    });
  }

  private async completeCampaignIfFinished(campaignId: string) {
    const outstanding = await this.prismaService.marketingDelivery.count({
      where: { campaignId, status: { in: ['QUEUED', 'PROCESSING'] } },
    });
    if (outstanding === 0) {
      await this.prismaService.marketingCampaign.update({
        where: { id: campaignId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }
  }
}
