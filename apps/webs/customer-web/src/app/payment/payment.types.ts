export type PaymentItemView = {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  skuValue: string;
  quantity: number;
  price: number;
};

export type PaymentShopGroupView = {
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  items: PaymentItemView[];
};

export type PaymentVoucherView = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderSubtotal: number;
  maxDiscount?: number;
};
