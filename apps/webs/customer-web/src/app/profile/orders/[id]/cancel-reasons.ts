export const CUSTOMER_CANCEL_REASONS = [
  { code: 'CHANGED_MIND', label: 'Tôi đổi ý, không muốn mua nữa' },
  { code: 'ORDERED_BY_MISTAKE', label: 'Tôi đặt nhầm sản phẩm' },
  { code: 'CHANGE_PRODUCT', label: 'Tôi muốn thay đổi sản phẩm hoặc phân loại' },
  { code: 'CHANGE_ADDRESS', label: 'Tôi muốn thay đổi địa chỉ nhận hàng' },
  { code: 'PAYMENT_ISSUE', label: 'Tôi gặp vấn đề khi thanh toán' },
  { code: 'OTHER', label: 'Lý do khác' },
] as const;

export type CustomerCancelReasonCode =
  (typeof CUSTOMER_CANCEL_REASONS)[number]['code'];

export function getCustomerCancelReasonLabel(reasonCode: string): string {
  return (
    CUSTOMER_CANCEL_REASONS.find((reason) => reason.code === reasonCode)?.label ??
    reasonCode
  );
}
