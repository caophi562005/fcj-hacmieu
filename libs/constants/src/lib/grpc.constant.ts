export enum GrpcService {
  IAM_SERVICE = 'IAM_SERVICE',
  CATALOG_SERVICE = 'CATALOG_SERVICE',
  SHOP_SERVICE = 'SHOP_SERVICE',
  PROMOTION_SERVICE = 'PROMOTION_SERVICE',
  ORDER_SERVICE = 'ORDER_SERVICE',
  PAYMENT_SERVICE = 'PAYMENT_SERVICE',
  UTILITY_SERVICE = 'UTILITY_SERVICE',
}

export const GrpcModuleName = {
  CATALOG: {
    PRODUCT: 'ProductModule',
    ATTRIBUTE: 'AttributeModule',
    CATEGORY: 'CategoryModule',
    BRAND: 'BrandModule',
    SKU: 'SkuModule',
  },

  ORDER: {
    ORDER: 'OrderModule',
    CART: 'CartModule',
  },

  PROMOTION: {
    PROMOTION: 'PromotionModule',
    REDEMPTION: 'RedemptionModule',
  },

  PAYMENT: {
    PAYMENT: 'PaymentModule',
    TRANSACTION: 'TransactionModule',
    REFUND: 'RefundModule',
  },

  UTILITY: {
    NOTIFICATION: 'NotificationService',
    MEDIA: 'MediaService',
    REPORT: 'ReportService',
    REVIEW: 'ReviewService',
    LOCATION: 'LocationService',
  },

  IAM: {
    USER: 'UserModule',
    PERMISSION: 'PermissionModule',
    ADDRESS: 'AddressModule',
    AUTH: 'AuthModule',
  },

  SHOP: {
    MERCHANT: 'MerchantModule',
    SHOP: 'ShopModule',
  },
} as const;
