import { MarketingConfiguration } from '@common/configurations/marketing.config';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

export type SendMarketingEmailInput = {
  to: string;
  subject: string;
  html: string;
  unsubscribeUrl: string;
  tags: Array<{ name: string; value: string }>;
};

@Injectable()
export class ResendMarketingEmailProvider {
  async send(input: SendMarketingEmailInput): Promise<{ messageId: string }> {
    if (!MarketingConfiguration.RESEND_API_KEY) {
      throw new ServiceUnavailableException('Error.ResendApiKeyMissing');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MarketingConfiguration.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MarketingConfiguration.MARKETING_FROM_EMAIL,
        to: [input.to],
        reply_to: MarketingConfiguration.MARKETING_REPLY_TO,
        subject: input.subject.startsWith('[QC]')
          ? input.subject
          : `[QC] ${input.subject}`,
        html: input.html,
        headers: {
          'List-Unsubscribe': `<${input.unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: input.tags,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      error?: { message?: string };
    };
    if (!response.ok || !body.id) {
      throw new ServiceUnavailableException(
        body.error?.message || body.message || 'Error.ResendSendFailed',
      );
    }
    return { messageId: body.id };
  }

  verifyWebhook(input: {
    payload: string;
    svixId: string;
    svixTimestamp: string;
    svixSignature: string;
  }): boolean {
    const secret = MarketingConfiguration.RESEND_WEBHOOK_SECRET;
    if (!secret) return false;

    const timestamp = Number(input.svixTimestamp);
    if (
      !Number.isFinite(timestamp) ||
      Math.abs(Date.now() / 1000 - timestamp) > 5 * 60
    ) {
      return false;
    }

    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const expected = createHmac('sha256', key)
      .update(`${input.svixId}.${input.svixTimestamp}.${input.payload}`)
      .digest('base64');

    return input.svixSignature.split(' ').some((entry) => {
      const [, suppliedValue] = entry.split(',');
      if (!suppliedValue) return false;
      const supplied = Buffer.from(suppliedValue);
      const wanted = Buffer.from(expected);
      return (
        supplied.length === wanted.length && timingSafeEqual(supplied, wanted)
      );
    });
  }
}
