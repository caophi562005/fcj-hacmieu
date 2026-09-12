export type AllocatableOrder = {
  key: string;
  itemTotal: number;
  shippingFee: number;
};

export type AllocatedOrder = AllocatableOrder & {
  voucherDiscount: number;
  coinApplied: number;
  discount: number;
  grandTotal: number;
};

export function allocateOrderDiscounts(
  orders: AllocatableOrder[],
  voucherAmount: number,
  requestedCoin: number,
): AllocatedOrder[] {
  const result = orders.map((order) => ({
    ...order,
    voucherDiscount: 0,
    coinApplied: 0,
    discount: 0,
    grandTotal: order.itemTotal + order.shippingFee,
  }));
  const sorted = [...result].sort((a, b) => a.itemTotal - b.itemTotal);

  let remainingVoucher = Math.max(0, Math.floor(voucherAmount));
  for (const order of sorted) {
    const applied = Math.min(remainingVoucher, order.itemTotal + order.shippingFee);
    order.voucherDiscount = applied;
    remainingVoucher -= applied;
  }

  let remainingCoin = Math.max(0, Math.floor(requestedCoin));
  for (const order of sorted) {
    const payable = Math.max(
      0,
      order.itemTotal + order.shippingFee - order.voucherDiscount,
    );
    const applied = Math.min(remainingCoin, payable);
    order.coinApplied = applied;
    remainingCoin -= applied;
  }

  for (const order of result) {
    order.discount = -(order.voucherDiscount + order.coinApplied);
    order.grandTotal = Math.max(
      0,
      order.itemTotal + order.shippingFee + order.discount,
    );
  }
  return result;
}
