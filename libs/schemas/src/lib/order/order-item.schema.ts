import z from 'zod';
import { BaseSchema } from '../common/base.schema';

export const OrderItemSchema = BaseSchema.extend({
  orderId: z.uuid(),
  productId: z.uuid(),
  skuId: z.uuid(),
  shopId: z.uuid(),
  productName: z.string(),
  skuValue: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  total: z.number().min(0),
  productImage: z.string(),
});
