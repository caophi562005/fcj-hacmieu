import { AppConfiguration } from '@common/configurations/app.config';
import { MarketingConfiguration } from '@common/configurations/marketing.config';
import { MarketingTopicType } from '@common/constants/user.constant';
import { createMarketingUnsubscribeToken } from '@common/utils/marketing-token.util';
import { Injectable } from '@nestjs/common';

type PromotionTemplateData = {
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderSubtotal: number;
  maxDiscount: number | null;
  endsAt: Date | null;
};

@Injectable()
export class MarketingTemplateService {
  announcement(input: {
    recipientEmail: string;
    recipientName: string;
    introContent: string;
    preheader?: string | null;
    promotion: PromotionTemplateData;
  }) {
    return this.render({
      recipientEmail: input.recipientEmail,
      recipientName: input.recipientName,
      topic: 'PROMOTION_OFFERS',
      preheader: input.preheader,
      heading: input.promotion.name,
      introContent: input.introContent,
      promotion: input.promotion,
      ctaLabel: 'Nhận voucher ngay',
    });
  }

  voucherReminder(input: {
    recipientEmail: string;
    recipientName: string;
    promotion: PromotionTemplateData;
  }) {
    return this.render({
      recipientEmail: input.recipientEmail,
      recipientName: input.recipientName,
      topic: 'VOUCHER_REMINDERS',
      heading: `Voucher ${input.promotion.code} sắp hết hạn`,
      introContent:
        'Voucher bạn đã lưu sắp hết hạn. Hãy sử dụng trước khi ưu đãi kết thúc.',
      promotion: input.promotion,
      ctaLabel: 'Dùng voucher',
    });
  }

  private render(input: {
    recipientEmail: string;
    recipientName: string;
    topic: MarketingTopicType;
    heading: string;
    introContent: string;
    preheader?: string | null;
    promotion: PromotionTemplateData;
    ctaLabel: string;
  }) {
    const token = createMarketingUnsubscribeToken(
      {
        email: input.recipientEmail,
        topic: input.topic,
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      },
      MarketingConfiguration.MARKETING_UNSUBSCRIBE_SECRET,
    );
    const unsubscribeUrl = `${AppConfiguration.CUSTOMER_WEB_URL}/api/marketing/unsubscribe?token=${encodeURIComponent(token)}`;
    const voucherUrl = `${AppConfiguration.CUSTOMER_WEB_URL}/profile/voucher`;
    const discount =
      input.promotion.discountType === 'PERCENT'
        ? `${input.promotion.discountValue / 100}%`
        : this.money(input.promotion.discountValue);
    const expiry = input.promotion.endsAt
      ? new Intl.DateTimeFormat('vi-VN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Ho_Chi_Minh',
        }).format(input.promotion.endsAt)
      : 'Không giới hạn';

    return {
      unsubscribeUrl,
      html: `<!doctype html>
<html lang="vi"><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
<div style="display:none;max-height:0;overflow:hidden">${this.escape(input.preheader || input.heading)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
<tr><td style="padding:28px;background:#4f46e5;color:#fff"><strong style="font-size:24px">V-Shop</strong></td></tr>
<tr><td style="padding:32px">
<p>Xin chào ${this.escape(input.recipientName || 'bạn')},</p>
<h1 style="font-size:26px;line-height:1.25">${this.escape(input.heading)}</h1>
<p style="color:#475569;line-height:1.7">${this.escape(input.introContent)}</p>
<div style="margin:24px 0;padding:20px;background:#eef2ff;border-radius:12px">
<div style="font-size:13px;color:#6366f1;text-transform:uppercase">Mã voucher</div>
<div style="font-size:28px;font-weight:700;letter-spacing:2px">${this.escape(input.promotion.code)}</div>
<p style="margin-bottom:0">Giảm <strong>${discount}</strong> · Đơn tối thiểu ${this.money(input.promotion.minOrderSubtotal)}${input.promotion.maxDiscount ? ` · Tối đa ${this.money(input.promotion.maxDiscount)}` : ''}</p>
<p style="margin-bottom:0">Hết hạn: <strong>${expiry}</strong></p>
</div>
<a href="${voucherUrl}" style="display:inline-block;padding:13px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:9px;font-weight:700">${this.escape(input.ctaLabel)}</a>
</td></tr>
<tr><td style="padding:24px 32px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.6">
<p>${this.escape(MarketingConfiguration.MARKETING_ADVERTISER_NAME)} · ${this.escape(MarketingConfiguration.MARKETING_ADVERTISER_PHONE)}<br>${this.escape(MarketingConfiguration.MARKETING_ADVERTISER_ADDRESS)} · ${this.escape(MarketingConfiguration.MARKETING_REPLY_TO)}</p>
<p>Bạn nhận email vì đã đồng ý nhận thông tin tiếp thị từ V-Shop. <a href="${unsubscribeUrl}">Ngừng nhận loại email này</a>.</p>
</td></tr></table></td></tr></table></body></html>`,
    };
  }

  private money(value: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  private escape(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
