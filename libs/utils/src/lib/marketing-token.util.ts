import { createHmac, timingSafeEqual } from 'crypto';

export type MarketingUnsubscribePayload = {
  email: string;
  topic: 'PROMOTION_OFFERS' | 'VOUCHER_REMINDERS';
  expiresAt: number;
};

export function createMarketingUnsubscribeToken(
  payload: MarketingUnsubscribePayload,
  secret: string,
): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url',
  );
  const signature = createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyMarketingUnsubscribeToken(
  token: string,
  secret: string,
): MarketingUnsubscribePayload | null {
  const [encodedPayload, suppliedSignature] = token.split('.');
  if (!encodedPayload || !suppliedSignature) return null;

  const expectedSignature = createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  const expected = Buffer.from(expectedSignature);
  const supplied = Buffer.from(suppliedSignature);
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as MarketingUnsubscribePayload;
    if (
      typeof payload.email !== 'string' ||
      !['PROMOTION_OFFERS', 'VOUCHER_REMINDERS'].includes(payload.topic) ||
      !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
