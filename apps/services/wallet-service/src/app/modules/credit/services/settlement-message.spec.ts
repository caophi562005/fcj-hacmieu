import { describe, expect, it } from 'vitest';
import { parseSettlementMessageBody } from './settlement-message';

const payload = {
  orderId: '6f92e344-c229-463d-8f9d-2f91b6e37bbe',
  shopId: '05459f14-f424-44ef-afc7-4f82e9a2ea5c',
  grossAmount: 180000,
  commissionRate: 20,
  commissionFee: 36000,
  taxRate: 1.5,
  taxWithheld: 2700,
  netSellerAmount: 141300,
  completedAt: '2026-09-13T17:04:04.283Z',
};

describe('parseSettlementMessageBody', () => {
  it('extracts the payload from an ORDER_COMPLETED outbox envelope', () => {
    const result = parseSettlementMessageBody(
      JSON.stringify({
        version: 1,
        eventId: '55b2ede0-de62-4c4f-bb2b-189ed5fb8b41',
        eventType: 'ORDER_COMPLETED',
        occurredAt: '2026-09-13T17:04:04.295Z',
        payload,
      }),
    );

    expect(result).toEqual(payload);
  });

  it('continues to accept the legacy direct payload format', () => {
    expect(parseSettlementMessageBody(JSON.stringify(payload))).toEqual(
      payload,
    );
  });

  it('rejects an envelope for another event type', () => {
    expect(() =>
      parseSettlementMessageBody(
        JSON.stringify({ eventType: 'WALLET_REFUND', payload }),
      ),
    ).toThrow('Unsupported settlement event');
  });
});
