import { allocateOrderDiscounts } from './order-allocation';

describe('multi-shop order allocation', () => {
  it('stores voucher and coin independently while preserving total discount', () => {
    const result = allocateOrderDiscounts(
      [
        { key: 'large', itemTotal: 100_000, shippingFee: 0 },
        { key: 'small', itemTotal: 40_000, shippingFee: 10_000 },
      ],
      60_000,
      30_000,
    );

    expect(result).toEqual([
      {
        key: 'large',
        itemTotal: 100_000,
        shippingFee: 0,
        voucherDiscount: 10_000,
        coinApplied: 30_000,
        discount: -40_000,
        grandTotal: 60_000,
      },
      {
        key: 'small',
        itemTotal: 40_000,
        shippingFee: 10_000,
        voucherDiscount: 50_000,
        coinApplied: 0,
        discount: -50_000,
        grandTotal: 0,
      },
    ]);
  });

  it('never allocates more coin than remains payable', () => {
    const [order] = allocateOrderDiscounts(
      [{ key: 'one', itemTotal: 20_000, shippingFee: 0 }],
      15_000,
      20_000,
    );
    expect(order.coinApplied).toBe(5_000);
    expect(order.grandTotal).toBe(0);
  });
});
