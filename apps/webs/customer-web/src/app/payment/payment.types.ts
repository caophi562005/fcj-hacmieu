export type PaymentItemView = {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  skuValue: string;
  quantity: number;
  price: number;
  provinceId: number;
  districtId: number;
  wardId: number;
  weightGram: number;
};

export type PaymentShopGroupView = {
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  pickupDistrictId: number;
  pickupWardId: number;
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
