import { OrderItemSchema, OrderSchema } from '@common/schemas/order';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const OrderItemResponseSchema = OrderItemSchema;

export const OrderResponseSchema = OrderSchema;

export const CreateOrderResponseSchema = z.object({
  orders: z.array(OrderResponseSchema),
});

export const GetOrderResponseSchema = OrderSchema.pick({
  id: true,
  code: true,

  userId: true,
  shopId: true,

  status: true,
  paymentMethod: true,
  paymentStatus: true,
  paymentId: true,

  itemTotal: true,
  shippingFee: true,
  discount: true,
  grandTotal: true,

  receiver: true,
  timeline: true,

  createdAt: true,
  updatedAt: true,
}).safeExtend({
  shopName: z.string(),
  receiverName: z.string(),
  receiverPhone: z.string(),
  receiverAddress: z.string(),
  itemsSnapshot: z.array(
    OrderItemResponseSchema.pick({
      id: true,
      productId: true,
      productImage: true,
      productName: true,
      skuValue: true,
      quantity: true,
      price: true,
    })
  ),
  firstProductName: z.string(),
  firstProductImage: z.string(),
});

export const GetManyOrdersResponseSchema = PaginationQueryResponseSchema.extend(
  {
    orders: z.array(
      z.object({
        id: z.uuid(),
        code: z.string(),
        shopId: z.uuid(),
        shopName: z.string(),
        status: z.string(),
        itemTotal: z.number(),
        grandTotal: z.number(),
        firstProductImage: z.string(),
        firstProductName: z.string(),
        createdAt: z.any(),
      })
    ),
  }
);

export const DashboardSellerResponseSchema = z.object({
  totalOrders: z.number(),
  completedOrders: z.number(),
  pendingOrders: z.number(),
  confirmedOrders: z.number(),
  totalRevenue: z.number(),
});

export type OrderItemResponse = z.infer<typeof OrderItemResponseSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type GetManyOrdersResponse = z.infer<typeof GetManyOrdersResponseSchema>;
export type GetOrderResponse = z.infer<typeof GetOrderResponseSchema>;
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;
export type DashboardSellerResponse = z.infer<
  typeof DashboardSellerResponseSchema
>;
