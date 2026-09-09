import { MarketingConfiguration } from '@common/configurations/marketing.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import {
  MarketingCampaignStatusValues,
  MarketingDeliveryStatusType,
} from '@common/constants/promotion.constant';
import { MarketingTopicValues } from '@common/constants/user.constant';
import {
  CreateMarketingCampaignRequest,
  DispatchMarketingCampaignRequest,
  GetManyMarketingCampaignsRequest,
  GetManyMarketingCampaignsResponse,
  GetMarketingCampaignRequest,
  MarketingCampaignResponse,
  MarketingDeliveryResponse,
  MarketingOperationResponse,
  ProcessMarketingDeliveryRequest,
  RecordMarketingWebhookRequest,
  ScanMarketingRequest,
} from '@common/interfaces/models/promotion';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { v4 as uuidv4 } from 'uuid';
import {
  MarketingCampaign as PrismaMarketingCampaign,
  Prisma,
} from '../../../../generated/prisma-client/client';
import {
  MarketingRepository,
  NewMarketingDelivery,
} from '../repositories/marketing.repository';
import { ResendMarketingEmailProvider } from '../providers/resend-marketing-email.provider';
import { MarketingRecipientService } from './marketing-recipient.service';
import { MarketingTemplateService } from './marketing-template.service';

@Injectable()
export class MarketingService {
  constructor(
    private readonly repository: MarketingRepository,
    private readonly recipients: MarketingRecipientService,
    private readonly templates: MarketingTemplateService,
    private readonly emailProvider: ResendMarketingEmailProvider,
    private readonly sqsService: SqsService,
  ) {}

  async list(
    data: GetManyMarketingCampaignsRequest,
  ): Promise<GetManyMarketingCampaignsResponse> {
    const result = await this.repository.listCampaigns(data);
    return {
      ...result,
      campaigns: result.campaigns.map((campaign) =>
        this.toCampaignResponse(campaign),
      ),
    };
  }

  async find(
    data: GetMarketingCampaignRequest,
  ): Promise<MarketingCampaignResponse> {
    const campaign = await this.repository.findCampaign(data.id);
    if (!campaign)
      throw new NotFoundException('Error.MarketingCampaignNotFound');
    return this.toCampaignResponse(campaign);
  }

  async create(
    data: CreateMarketingCampaignRequest,
  ): Promise<MarketingCampaignResponse> {
    const promotion = await this.repository.findPromotion(data.promotionId);
    if (!promotion) throw new NotFoundException('Error.PromotionNotFound');
    if (promotion.endsAt && promotion.endsAt <= new Date()) {
      throw new BadRequestException('Error.PromotionExpired');
    }
    if (
      data.scheduledAt &&
      promotion.endsAt &&
      new Date(data.scheduledAt) >= promotion.endsAt
    ) {
      throw new BadRequestException('Error.CampaignScheduledAfterPromotionEnd');
    }
    const campaign = await this.repository.createCampaign(data);
    return this.toCampaignResponse(campaign);
  }

  async dispatch(
    data: DispatchMarketingCampaignRequest,
  ): Promise<MarketingOperationResponse> {
    const campaign = await this.repository.findCampaign(data.id);
    if (!campaign)
      throw new NotFoundException('Error.MarketingCampaignNotFound');
    const dispatchableStatuses = new Set<string>([
      MarketingCampaignStatusValues.DRAFT,
      MarketingCampaignStatusValues.SCHEDULED,
      MarketingCampaignStatusValues.FAILED,
    ]);
    if (!dispatchableStatuses.has(campaign.status)) {
      throw new BadRequestException('Error.MarketingCampaignCannotDispatch');
    }
    const now = new Date();
    if (
      campaign.promotion.status !== 'ACTIVE' ||
      (campaign.promotion.startsAt && campaign.promotion.startsAt > now) ||
      (campaign.promotion.endsAt && campaign.promotion.endsAt <= now)
    ) {
      throw new BadRequestException('Error.PromotionNotInValidTime');
    }

    await this.repository.markCampaignProcessing(campaign.id);
    try {
      let page = 1;
      let totalPages = 1;
      let queuedCount = 0;
      do {
        const recipientPage = await this.recipients.list({
          topic: MarketingTopicValues.PROMOTION_OFFERS,
          page,
          limit: 100,
          userIds: [],
        });
        totalPages = recipientPage.totalPages;
        const deliveries: NewMarketingDelivery[] = recipientPage.recipients.map(
          (recipient) => {
            const rendered = this.templates.announcement({
              recipientEmail: recipient.email,
              recipientName: recipient.username,
              introContent: campaign.introContent,
              preheader: campaign.preheader,
              promotion: campaign.promotion,
            });
            return {
              type: 'PROMOTION_ANNOUNCEMENT',
              dedupeKey: `announcement:${campaign.id}:${recipient.userId}`,
              campaignId: campaign.id,
              promotionId: campaign.promotionId,
              userId: recipient.userId,
              recipientEmail: recipient.email,
              recipientName: recipient.username,
              subject: campaign.subject,
              htmlContent: rendered.html,
            };
          },
        );
        const created = await this.repository.createDeliveries(deliveries);
        for (const delivery of created) {
          await this.enqueueDelivery(delivery.id);
          queuedCount += 1;
        }
        page += 1;
      } while (page <= totalPages);

      await this.repository.markCampaignQueued(campaign.id, queuedCount);
      return {
        accepted: true,
        queuedCount,
        message:
          queuedCount > 0
            ? 'Marketing campaign queued'
            : 'No opted-in recipients',
      };
    } catch (error) {
      await this.repository.markCampaignFailed(campaign.id);
      throw error;
    }
  }

  async scan(data: ScanMarketingRequest): Promise<MarketingOperationResponse> {
    const now = data.now ? new Date(data.now) : new Date();
    let queuedCount = 0;

    const dueCampaigns = await this.repository.findDueCampaigns(now);
    for (const campaign of dueCampaigns) {
      const result = await this.dispatch({ id: campaign.id });
      queuedCount += result.queuedCount;
    }

    const deadline = new Date(
      now.getTime() + MarketingConfiguration.MARKETING_REMINDER_HOURS * 3600000,
    );
    const redemptions = await this.repository.findExpiringRedemptions(
      now,
      deadline,
    );
    const userIds = Array.from(new Set(redemptions.map((item) => item.userId)));
    if (userIds.length) {
      const recipientPage = await this.recipients.list({
        topic: MarketingTopicValues.VOUCHER_REMINDERS,
        page: 1,
        limit: 500,
        userIds,
      });
      const recipientByUser = new Map(
        recipientPage.recipients.map((recipient) => [
          recipient.userId,
          recipient,
        ]),
      );
      const items: NewMarketingDelivery[] = [];
      for (const redemption of redemptions) {
        const recipient = recipientByUser.get(redemption.userId);
        if (!recipient) continue;
        const rendered = this.templates.voucherReminder({
          recipientEmail: recipient.email,
          recipientName: recipient.username,
          promotion: redemption.promotion,
        });
        items.push({
          type: 'VOUCHER_EXPIRY_REMINDER',
          dedupeKey: `voucher-reminder:${redemption.id}:${MarketingConfiguration.MARKETING_REMINDER_HOURS}h`,
          promotionId: redemption.promotionId,
          redemptionId: redemption.id,
          userId: recipient.userId,
          recipientEmail: recipient.email,
          recipientName: recipient.username,
          subject: `Voucher ${redemption.code} sắp hết hạn`,
          htmlContent: rendered.html,
        });
      }
      const deliveries = await this.repository.createDeliveries(items);
      for (const delivery of deliveries) {
        await this.enqueueDelivery(delivery.id);
        queuedCount += 1;
      }
    }

    return {
      accepted: true,
      queuedCount,
      message: 'Scheduled campaigns and voucher reminders scanned',
    };
  }

  async processDelivery(
    data: ProcessMarketingDeliveryRequest,
  ): Promise<MarketingDeliveryResponse> {
    const delivery = await this.repository.getDelivery(data.deliveryId);
    if (!delivery)
      throw new NotFoundException('Error.MarketingDeliveryNotFound');
    const claimed = await this.repository.claimDelivery(delivery.id);
    if (!claimed) return this.toDeliveryResponse(delivery);

    try {
      const topic =
        delivery.type === 'PROMOTION_ANNOUNCEMENT'
          ? MarketingTopicValues.PROMOTION_OFFERS
          : MarketingTopicValues.VOUCHER_REMINDERS;
      const currentRecipient = await this.recipients.list({
        topic,
        page: 1,
        limit: 1,
        userIds: [delivery.userId],
      });
      if (currentRecipient.totalItems === 0) {
        const skipped = await this.repository.markDeliveryFailed(
          delivery.id,
          'Recipient unsubscribed before send',
        );
        return this.toDeliveryResponse(skipped);
      }

      const unsubscribeUrl = this.extractUnsubscribeUrl(delivery.htmlContent);
      const result = await this.emailProvider.send({
        to: delivery.recipientEmail,
        subject: delivery.subject,
        html: delivery.htmlContent,
        unsubscribeUrl,
        tags: [
          { name: 'delivery_id', value: delivery.id },
          { name: 'email_type', value: delivery.type.toLowerCase() },
        ],
      });
      const sent = await this.repository.markDeliverySent(
        delivery.id,
        result.messageId,
      );
      return this.toDeliveryResponse(sent);
    } catch (error) {
      const failed = await this.repository.markDeliveryFailed(
        delivery.id,
        error instanceof Error ? error.message : 'Unknown email error',
      );
      throw error instanceof Error
        ? error
        : new Error(failed.errorMessage || 'Email failed');
    }
  }

  async recordWebhook(
    data: RecordMarketingWebhookRequest,
  ): Promise<MarketingOperationResponse> {
    if (!this.emailProvider.verifyWebhook(data)) {
      throw new UnauthorizedException('Error.InvalidResendWebhookSignature');
    }
    let payload: { type?: string; data?: { email_id?: string } };
    try {
      payload = JSON.parse(data.payload) as typeof payload;
    } catch {
      throw new BadRequestException('Error.InvalidResendWebhookPayload');
    }
    const providerMessageId = payload.data?.email_id;
    if (!payload.type || !providerMessageId) {
      throw new BadRequestException('Error.InvalidResendWebhookPayload');
    }
    const eventMap: Record<
      string,
      {
        status: MarketingDeliveryStatusType;
        timestampField:
          | 'deliveredAt'
          | 'openedAt'
          | 'clickedAt'
          | 'bouncedAt'
          | 'complainedAt';
        campaignCounter:
          | 'deliveredCount'
          | 'openedCount'
          | 'clickedCount'
          | 'bouncedCount'
          | 'complainedCount';
      }
    > = {
      'email.delivered': {
        status: 'DELIVERED',
        timestampField: 'deliveredAt',
        campaignCounter: 'deliveredCount',
      },
      'email.opened': {
        status: 'OPENED',
        timestampField: 'openedAt',
        campaignCounter: 'openedCount',
      },
      'email.clicked': {
        status: 'CLICKED',
        timestampField: 'clickedAt',
        campaignCounter: 'clickedCount',
      },
      'email.bounced': {
        status: 'BOUNCED',
        timestampField: 'bouncedAt',
        campaignCounter: 'bouncedCount',
      },
      'email.complained': {
        status: 'COMPLAINED',
        timestampField: 'complainedAt',
        campaignCounter: 'complainedCount',
      },
    };
    await this.repository.recordProviderEvent({
      providerEventId: data.svixId,
      providerMessageId,
      type: payload.type,
      payload: payload as Prisma.InputJsonValue,
      ...eventMap[payload.type],
    });
    return { accepted: true, queuedCount: 0, message: 'Webhook accepted' };
  }

  private async enqueueDelivery(deliveryId: string) {
    await this.sqsService.send(
      SqsConfiguration.SEND_MARKETING_EMAIL_QUEUE_NAME,
      {
        id: uuidv4(),
        body: { deliveryId },
      },
    );
  }

  private extractUnsubscribeUrl(html: string) {
    const match = html.match(/href="([^"]+)"[^>]*>Ngừng nhận loại email này/);
    if (!match?.[1]) throw new Error('Unsubscribe URL is missing');
    return match[1];
  }

  private toCampaignResponse(
    campaign: PrismaMarketingCampaign & {
      promotion: { code: string; name: string };
    },
  ): MarketingCampaignResponse {
    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      promotionId: campaign.promotionId,
      promotionCode: campaign.promotion.code,
      promotionName: campaign.promotion.name,
      subject: campaign.subject,
      preheader: campaign.preheader,
      introContent: campaign.introContent,
      scheduledAt: campaign.scheduledAt,
      startedAt: campaign.startedAt,
      completedAt: campaign.completedAt,
      recipientCount: campaign.recipientCount,
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      openedCount: campaign.openedCount,
      clickedCount: campaign.clickedCount,
      bouncedCount: campaign.bouncedCount,
      complainedCount: campaign.complainedCount,
      createdById: campaign.createdById,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  private toDeliveryResponse(delivery: {
    id: string;
    type: string;
    status: string;
    campaignId: string | null;
    promotionId: string;
    redemptionId: string | null;
    userId: string;
    recipientEmail: string;
    providerMessageId: string | null;
    errorMessage: string | null;
    sentAt: Date | null;
    createdAt: Date;
  }): MarketingDeliveryResponse {
    return delivery as MarketingDeliveryResponse;
  }
}
