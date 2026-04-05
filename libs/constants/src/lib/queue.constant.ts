export enum QueueService {
  QUERY_SERVICE = 'query',
  BFF_WEB_SERVICE = 'bff-web',
  PRODUCT_SERVICE = 'product',
  NOTIFICATION_SERVICE = 'notification',
  CART_SERVICE = 'cart',
  ORDER_SERVICE = 'order',
  PAYMENT_SERVICE = 'payment',
  MEDIA_SERVICE = 'media',
  ROLE_SERVICE = 'role',
}

export enum QueueGroups {
  QUERY_GROUP = 'query-group',
  USER_ACCESS_GROUP = 'user-access-group',
  PRODUCT_GROUP = 'product-group',
  CART_GROUP = 'cart-group',
  ORDER_GROUP = 'order-group',
  PAYMENT_GROUP = 'payment-group',
  MEDIA_GROUP = 'media-group',
  PROMOTION_GROUP = 'promotion-group',
}

enum CategoryQueueTopics {
  CREATE_CATEGORY = 'create_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',
}

enum ProductQueueTopics {
  CREATE_PRODUCT = 'create_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',
  STOCK_DECREASE = 'stock_decrease',
}

enum BrandQueueTopics {
  CREATE_BRAND = 'create_brand',
  UPDATE_BRAND = 'update_brand',
  DELETE_BRAND = 'delete_brand',
}

enum AttributeQueueTopics {
  CREATE_ATTRIBUTE = 'create_attribute',
  UPDATE_ATTRIBUTE = 'update_attribute',
  DELETE_ATTRIBUTE = 'delete_attribute',
}

enum ShipsFromQueueTopics {
  CREATE_SHIPS_FROM = 'create_ships_from',
  UPDATE_SHIPS_FROM = 'update_ships_from',
  DELETE_SHIPS_FROM = 'delete_ships_from',
}

enum UserAccessQueueTopics {
  SEND_OTP = 'send_otp',
  UPDATE_SHOP = 'update_shop',
}

enum NotificationQueueTopics {
  CREATE_NOTIFICATION = 'create_notification',
  READ_NOTIFICATION = 'read_notification',
  DELETE_NOTIFICATION = 'delete_notification',
}

enum CartQueueTopics {
  ADD_CART = 'add_cart',
  UPDATE_CART = 'update_cart',
  DELETE_CART = 'delete_cart',
}

enum OrderQueueTopics {
  CREATE_ORDER = 'create_order',
  UPDATE_ORDER = 'update_order',
  CANCEL_ORDER = 'cancel_order',
  CREATE_PAYMENT_BY_ORDER = 'create_payment_by_order',
  PAID_ORDER = 'paid_order',
}

enum PaymentQueueTopics {
  CANCEL_ORDER_BY_PAYMENT = 'cancel_order_by_payment',
}

enum MediaQueueTopics {
  UPSERT_VIDEO = 'upsert_video',
  DELETE_VIDEO = 'delete_video',
  VIDEO_UPLOADED = 'video_uploaded',
}

enum PromotionQueueTopics {
  CREATE_REDEMPTION = 'create_redemption',
}

enum ReviewQueueTopics {
  CREATE_REVIEW = 'review.created',
  UPDATE_REVIEW = 'review.updated',
  DELETE_REVIEW = 'review.deleted',

  CREATE_REPLY = 'reply.created',
  UPDATE_REPLY = 'reply.updated',
  DELETE_REPLY = 'reply.deleted',
}

enum ReportQueueTopics {
  CREATE_REPORT = 'report.created',
  UPDATE_STATUS = 'report.status-updated',
  DELETE_REPORT = 'report.deleted',
}

export const QueueTopics = {
  CATEGORY: CategoryQueueTopics,
  PRODUCT: ProductQueueTopics,
  BRAND: BrandQueueTopics,
  USER_ACCESS: UserAccessQueueTopics,
  ATTRIBUTE: AttributeQueueTopics,
  SHIPS_FROM: ShipsFromQueueTopics,
  NOTIFICATION: NotificationQueueTopics,
  CART: CartQueueTopics,
  ORDER: OrderQueueTopics,
  PAYMENT: PaymentQueueTopics,
  MEDIA: MediaQueueTopics,
  PROMOTION: PromotionQueueTopics,
  REVIEW: ReviewQueueTopics,
  REPORT: ReportQueueTopics,
} as const;
