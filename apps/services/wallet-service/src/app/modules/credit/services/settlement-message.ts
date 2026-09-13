import {
  CreateSellerSettlementRequest,
  CreateSellerSettlementRequestSchema,
} from '@common/interfaces/models/wallet';

type SettlementEnvelope = {
  eventType?: unknown;
  payload?: unknown;
};

function isSettlementEnvelope(value: unknown): value is SettlementEnvelope {
  return typeof value === 'object' && value !== null && 'payload' in value;
}

export function parseSettlementMessageBody(
  body: string,
): CreateSellerSettlementRequest {
  const parsed: unknown = JSON.parse(body);

  if (!isSettlementEnvelope(parsed)) {
    // Backward compatibility for messages published before the outbox envelope.
    return CreateSellerSettlementRequestSchema.parse(parsed);
  }

  if (parsed.eventType !== 'ORDER_COMPLETED') {
    throw new Error(
      `Unsupported settlement event: ${String(parsed.eventType)}`,
    );
  }

  return CreateSellerSettlementRequestSchema.parse(parsed.payload);
}
