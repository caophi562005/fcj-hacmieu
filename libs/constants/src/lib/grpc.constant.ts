export enum GrpcService {
  IAM_SERVICE = 'IAM_SERVICE',
  CATALOG_SERVICE = 'CATALOG_SERVICE',
  SHOP_SERVICE = 'SHOP_SERVICE',
  PROMOTION_SERVICE = 'PROMOTION_SERVICE',
  ORDER_SERVICE = 'ORDER_SERVICE',
  PAYMENT_SERVICE = 'PAYMENT_SERVICE',
  UTILITY_SERVICE = 'UTILITY_SERVICE',
  WALLET_SERVICE = 'WALLET_SERVICE',
  AI_SERVICE = 'AI_SERVICE',
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
    MARKETING: 'MarketingModule',
  },

  PAYMENT: {
    PAYMENT: 'PaymentModule',
    TRANSACTION: 'TransactionModule',
    REFUND: 'RefundModule',
  },

  UTILITY: {
    NOTIFICATION: 'NotificationService',
    MEDIA: 'MediaService',
    VIDEO: 'VideoService',
    REPORT: 'ReportService',
    REVIEW: 'ReviewService',
    LOCATION: 'LocationService',
  },

  IAM: {
    USER: 'UserModule',
    MARKETING_PREFERENCE: 'MarketingPreferenceModule',
    PERMISSION: 'PermissionModule',
    AUTH: 'AuthModule',
  },

  SHOP: {
    MERCHANT: 'MerchantModule',
    SHOP: 'ShopModule',
  },

  WALLET: {
    WALLET: 'WalletModule',
    CREDIT: 'CreditModule',
    PAYOUT: 'PayoutModule',
    PLATFORM_LEDGER: 'PlatformLedgerModule',
    SETTLEMENT: 'SellerSettlementModule',
    PRODUCT_PLACEMENT: 'ProductPlacementModule',
  },

  AI: {
    REVIEW_SUMMARY: 'ReviewSummaryModule',
  },
} as const;
