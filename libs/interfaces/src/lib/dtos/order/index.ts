import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CancelOrderRequestSchema,
  CreateOrderRequestSchema,
  CreateOrderResponseSchema,
  DashboardSellerResponseSchema,
  GetManyOrdersRequestSchema,
  GetManyOrdersResponseSchema,
  GetOrderRequestSchema,
  GetOrderResponseSchema,
  UpdateStatusOrderRequestSchema,
} from '@common/interfaces/models/order';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export class GetManyOrdersRequestDto extends createZodDto(
  GetManyOrdersRequestSchema
) {}

export class GetOrderRequestDto extends createZodDto(GetOrderRequestSchema) {}

export class CreateOrderRequestDto extends createZodDto(
  CreateOrderRequestSchema
) {}

export class UpdateOrderStatusRequestDto extends createZodDto(
  UpdateStatusOrderRequestSchema
) {}

export class CancelOrderRequestDto extends createZodDto(
  CancelOrderRequestSchema
) {}

//=================================================================================================
export class CreateOrderResponseDto extends createZodDto(
  ResponseSchema(CreateOrderResponseSchema)
) {}

export class GetManyOrdersResponseDto extends createZodDto(
  ResponseSchema(GetManyOrdersResponseSchema)
) {}

export class GetOrderResponseDto extends createZodDto(
  ResponseSchema(GetOrderResponseSchema)
) {}

export class DashboardSellerResponseDto extends createZodDto(
  ResponseSchema(
    z.object({
      orders: DashboardSellerResponseSchema,
      products: z.object({
        totalProducts: z.number(),
      }),
    })
  )
) {}
