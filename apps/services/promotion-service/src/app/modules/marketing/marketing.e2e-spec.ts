import { MarketingTemplateService } from './services/marketing-template.service';
import { MarketingService } from './services/marketing.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const campaignId = '11111111-1111-4111-8111-111111111111';
const promotionId = '22222222-2222-4222-8222-222222222222';
const userId = '33333333-3333-4333-8333-333333333333';
const deliveryId = '44444444-4444-4444-8444-444444444444';
const redemptionId = '55555555-5555-4555-8555-555555555555';

function promotion() {
  return {
    id: promotionId,
    code: 'SALE20',
    name: 'Ưu đãi tháng 9',
    description: null,
    status: 'ACTIVE',
    startsAt: new Date(Date.now() - 3600000),
    endsAt: new Date(Date.now() + 12 * 3600000),
    scope: 'ORDER',
    minOrderSubtotal: 100000,
    discountType: 'PERCENT',
    discountValue: 2000,
    maxDiscount: 50000,
    totalLimit: 100,
    usedCount: 0,
    createdById: null,
    updatedById: null,
    deletedById: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function campaign() {
  return {
    id: campaignId,
    name: 'Ra mắt SALE20',
    type: 'PROMOTION_ANNOUNCEMENT',
    status: 'DRAFT',
    promotionId,
    promotion: promotion(),
    subject: 'Giảm 20% cho đơn hàng hôm nay',
    preheader: 'Ưu đãi có hạn',
    introContent: 'Một ưu đãi dành riêng cho khách hàng V-Shop.',
    scheduledAt: null,
    startedAt: null,
    completedAt: null,
    recipientCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickedCount: 0,
    bouncedCount: 0,
    complainedCount: 0,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('Marketing flow e2e', () => {
  let repository: Record<string, ReturnType<typeof vi.fn>>;
  let recipients: { list: ReturnType<typeof vi.fn> };
  let provider: {
    send: ReturnType<typeof vi.fn>;
    verifyWebhook: ReturnType<typeof vi.fn>;
  };
  let sqs: { send: ReturnType<typeof vi.fn> };
  let service: MarketingService;

  beforeEach(() => {
    repository = {
      listCampaigns: vi.fn(),
      findCampaign: vi.fn(),
      findPromotion: vi.fn(),
      createCampaign: vi.fn(),
      markCampaignProcessing: vi.fn(),
      markCampaignQueued: vi.fn(),
      markCampaignFailed: vi.fn(),
      findDueCampaigns: vi.fn().mockResolvedValue([]),
      findExpiringRedemptions: vi.fn().mockResolvedValue([]),
      createDeliveries: vi.fn(),
      getDelivery: vi.fn(),
      claimDelivery: vi.fn(),
      markDeliverySent: vi.fn(),
      markDeliveryFailed: vi.fn(),
      recordProviderEvent: vi.fn(),
    };
    recipients = { list: vi.fn() };
    provider = { send: vi.fn(), verifyWebhook: vi.fn() };
    sqs = { send: vi.fn().mockResolvedValue(undefined) };
    service = new MarketingService(
      repository as never,
      recipients as never,
      new MarketingTemplateService(),
      provider as never,
      sqs as never,
    );
  });

  it('creates one announcement delivery for an opted-in customer and queues it', async () => {
    repository.findCampaign.mockResolvedValue(campaign());
    repository.markCampaignProcessing.mockResolvedValue(undefined);
    repository.markCampaignQueued.mockResolvedValue(undefined);
    recipients.list.mockResolvedValue({
      page: 1,
      limit: 100,
      totalItems: 1,
      totalPages: 1,
      recipients: [{ userId, email: 'customer@example.com', username: 'An' }],
    });
    repository.createDeliveries.mockImplementation(async (items) => [
      { ...items[0], id: deliveryId, status: 'QUEUED' },
    ]);

    const result = await service.dispatch({ id: campaignId });

    expect(result.queuedCount).toBe(1);
    expect(repository.createDeliveries).toHaveBeenCalledWith([
      expect.objectContaining({
        dedupeKey: `announcement:${campaignId}:${userId}`,
        type: 'PROMOTION_ANNOUNCEMENT',
        recipientEmail: 'customer@example.com',
      }),
    ]);
    expect(sqs.send).toHaveBeenCalledOnce();
    expect(repository.markCampaignQueued).toHaveBeenCalledWith(campaignId, 1);
  });

  it('creates a single expiring voucher reminder for customers opted into reminders', async () => {
    repository.findExpiringRedemptions.mockResolvedValue([
      {
        id: redemptionId,
        userId,
        promotionId,
        code: 'SALE20',
        promotion: promotion(),
      },
    ]);
    recipients.list.mockResolvedValue({
      page: 1,
      limit: 500,
      totalItems: 1,
      totalPages: 1,
      recipients: [{ userId, email: 'customer@example.com', username: 'An' }],
    });
    repository.createDeliveries.mockImplementation(async (items) => [
      { ...items[0], id: deliveryId, status: 'QUEUED' },
    ]);

    const result = await service.scan({ now: new Date().toISOString() });

    expect(result.queuedCount).toBe(1);
    expect(repository.createDeliveries).toHaveBeenCalledWith([
      expect.objectContaining({
        dedupeKey: `voucher-reminder:${redemptionId}:24h`,
        type: 'VOUCHER_EXPIRY_REMINDER',
      }),
    ]);
    expect(sqs.send).toHaveBeenCalledOnce();
  });

  it('rechecks consent before sending and skips an unsubscribed recipient', async () => {
    const delivery = {
      id: deliveryId,
      type: 'PROMOTION_ANNOUNCEMENT',
      status: 'QUEUED',
      campaignId,
      promotionId,
      redemptionId: null,
      userId,
      recipientEmail: 'customer@example.com',
      subject: 'Ưu đãi',
      htmlContent:
        '<a href="https://example.com/unsubscribe">Ngừng nhận loại email này</a>',
      providerMessageId: null,
      errorMessage: null,
      sentAt: null,
      createdAt: new Date(),
    };
    repository.getDelivery.mockResolvedValue(delivery);
    repository.claimDelivery.mockResolvedValue(true);
    recipients.list.mockResolvedValue({
      page: 1,
      limit: 1,
      totalItems: 0,
      totalPages: 0,
      recipients: [],
    });
    repository.markDeliveryFailed.mockResolvedValue({
      ...delivery,
      status: 'FAILED',
      errorMessage: 'Recipient unsubscribed before send',
    });

    const result = await service.processDelivery({ deliveryId });

    expect(result.status).toBe('FAILED');
    expect(provider.send).not.toHaveBeenCalled();
  });
});
