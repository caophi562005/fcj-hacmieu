import z from 'zod';

export const SqsConfigurationSchema = z.object({
  CREATE_PAYMENT_QUEUE_NAME: z.string(),
  CREATE_PAYMENT_QUEUE_URL: z.string(),

  CREATE_REDEMPTION_QUEUE_NAME: z.string(),
  CREATE_REDEMPTION_QUEUE_URL: z.string(),

  CREATE_ORDER_QUEUE_NAME: z.string(),
  CREATE_ORDER_QUEUE_URL: z.string(),

  SETTLE_ORDER_REVENUE_QUEUE_NAME: z.string(),
  SETTLE_ORDER_REVENUE_QUEUE_URL: z.string(),

  DELETE_CART_ITEM_QUEUE_NAME: z.string(),
  DELETE_CART_ITEM_QUEUE_URL: z.string(),

  SEND_NOTIFICATION_QUEUE_NAME: z.string(),
  SEND_NOTIFICATION_QUEUE_URL: z.string(),

  CREATE_USER_QUEUE_NAME: z.string(),
  CREATE_USER_QUEUE_URL: z.string(),

  UPDATE_VIDEO_STATUS_QUEUE_NAME: z.string(),
  UPDATE_VIDEO_STATUS_QUEUE_URL: z.string(),

  SEND_MARKETING_EMAIL_QUEUE_NAME: z.string().default('SEND_MARKETING_EMAIL'),
  SEND_MARKETING_EMAIL_QUEUE_URL: z
    .string()
    .default('https://sqs.ap-southeast-1.amazonaws.com/example/send-marketing-email'),
  SCAN_MARKETING_QUEUE_NAME: z.string().default('SCAN_MARKETING'),
  SCAN_MARKETING_QUEUE_URL: z
    .string()
    .default('https://sqs.ap-southeast-1.amazonaws.com/example/scan-marketing'),
  INVENTORY_COMMAND_QUEUE_NAME: z.string().default('INVENTORY_COMMAND'),
  INVENTORY_COMMAND_QUEUE_URL: z
    .string()
    .default('http://localhost:4566/000000000000/inventory-command'),
  PAYMENT_COMMAND_QUEUE_NAME: z.string().default('PAYMENT_COMMAND'),
  PAYMENT_COMMAND_QUEUE_URL: z
    .string()
    .default('http://localhost:4566/000000000000/payment-command'),
  WALLET_COMMAND_QUEUE_NAME: z.string().default('WALLET_COMMAND'),
  WALLET_COMMAND_QUEUE_URL: z
    .string()
    .default('http://localhost:4566/000000000000/wallet-command'),
  PROMOTION_COMMAND_QUEUE_NAME: z.string().default('PROMOTION_COMMAND'),
  PROMOTION_COMMAND_QUEUE_URL: z
    .string()
    .default('http://localhost:4566/000000000000/promotion-command'),
  NOTIFICATION_COMMAND_QUEUE_NAME: z.string().default('NOTIFICATION_COMMAND'),
  NOTIFICATION_COMMAND_QUEUE_URL: z
    .string()
    .default('http://localhost:4566/000000000000/notification-command'),
  CANCELLATION_RESULT_QUEUE_NAME: z.string().default('CANCELLATION_RESULT'),
  CANCELLATION_RESULT_QUEUE_URL: z
    .string()
    .default('http://localhost:4566/000000000000/cancellation-result'),
});

const configServer = SqsConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const SqsConfiguration = configServer.data;
