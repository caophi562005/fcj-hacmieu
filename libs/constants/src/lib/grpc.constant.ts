export enum GrpcService {
  IAM_SERVICE = 'IAM_SERVICE',
  CATALOG_SERVICE = 'CATALOG_SERVICE',
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
    NOTIFICATION: 'NotificationModule',
  },

  IAM: {
    USER: 'UserModule',
    PERMISSION: 'PermissionModule',
    ADDRESS: 'AddressModule',
    AUTH: 'AuthModule',
  },
} as const;
