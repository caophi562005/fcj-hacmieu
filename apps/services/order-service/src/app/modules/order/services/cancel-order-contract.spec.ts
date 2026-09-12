import { CancelOrderBodySchema } from '@common/interfaces/models/order';

describe('cancel order request contract', () => {
  it('accepts a reason code and optional trimmed note', () => {
    expect(
      CancelOrderBodySchema.parse({
        reasonCode: 'CHANGED_MIND',
        reasonNote: 'Ordered twice',
      }),
    ).toEqual({ reasonCode: 'CHANGED_MIND', reasonNote: 'Ordered twice' });
  });

  it.each([
    [{ reasonNote: 'missing code' }],
    [{ reasonCode: '' }],
    [{ reasonCode: 'x'.repeat(65) }],
    [{ reasonCode: 'CHANGED_MIND', reasonNote: 'x'.repeat(501) }],
    [{ reasonCode: 'CHANGED_MIND', actorType: 'ADMIN' }],
  ])('rejects invalid or public actor fields: %j', (body) => {
    expect(CancelOrderBodySchema.safeParse(body).success).toBe(false);
  });
});
