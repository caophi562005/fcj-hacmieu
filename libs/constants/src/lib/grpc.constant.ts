export enum GrpcService {
  USER_ACCESS_SERVICE = 'USER_ACCESS_SERVICE',
  MEDIA_SERVICE = 'MEDIA_SERVICE',
  ROLE_SERVICE = 'ROLE_SERVICE',
  PRODUCT_SERVICE = 'PRODUCT_SERVICE',
  QUERY_SERVICE = 'QUERY_SERVICE',
  NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE',
  CHAT_SERVICE = 'CHAT_SERVICE',
  CART_SERVICE = 'CART_SERVICE',
  ORDER_SERVICE = 'ORDER_SERVICE',
  PAYMENT_SERVICE = 'PAYMENT_SERVICE',
  REPORT_SERVICE = 'REPORT_SERVICE',
  REVIEW_SERVICE = 'REVIEW_SERVICE',
  PROMOTION_SERVICE = 'PROMOTION_SERVICE',
}

export enum GrpcServiceName {
  USER_ACCESS_SERVICE = 'UserAccessService',
  MEDIA_SERVICE = 'MediaService',
  ROLE_SERVICE = 'RoleService',
  PRODUCT_SERVICE = 'ProductService',
  QUERY_SERVICE = 'QueryService',
  NOTIFICATION_SERVICE = 'NotificationService',
  CHAT_SERVICE = 'ChatService',
  CART_SERVICE = 'CartService',
  ORDER_SERVICE = 'OrderService',
  PAYMENT_SERVICE = 'PaymentService',
  REPORT_SERVICE = 'ReportService',
  REVIEW_SERVICE = 'ReviewService',
  PROMOTION_SERVICE = 'PromotionService',
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
} as const;
