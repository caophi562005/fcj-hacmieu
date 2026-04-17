import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CancelOrderRequestSchema,
  CreateOrderRequestSchema,
  CreateOrderResponseSchema,
  DashboardSellerRequestSchema,
  DashboardSellerResponseSchema,
  GetManyOrdersRequestSchema,
  GetManyOrdersResponseSchema,
  GetOrderRequestSchema,
  GetOrderResponseSchema,
  UpdateStatusOrderRequestSchema,
} from '@common/interfaces/models/order';
import { createZodDto } from 'nestjs-zod';

export class GetManyOrdersRequestDto extends createZodDto(
  GetManyOrdersRequestSchema.omit({ processId: true }),
) {}

export class GetOrderRequestDto extends createZodDto(
  GetOrderRequestSchema.omit({ processId: true }),
) {}

export class CreateOrderRequestDto extends createZodDto(
  CreateOrderRequestSchema.omit({ processId: true, userId: true }),
) {}

export class UpdateOrderStatusRequestDto extends createZodDto(
  UpdateStatusOrderRequestSchema.omit({ processId: true }),
) {}

export class CancelOrderRequestDto extends createZodDto(
  CancelOrderRequestSchema.omit({ processId: true, userId: true }),
) {}

export class DashboardSellerRequestDto extends createZodDto(
  DashboardSellerRequestSchema.omit({ processId: true, userId: true }),
) {}

//=================================================================================================
export class CreateOrderResponseDto extends createZodDto(
  ResponseSchema(CreateOrderResponseSchema),
) {}

export class GetManyOrdersResponseDto extends createZodDto(
  ResponseSchema(GetManyOrdersResponseSchema),
) {}

export class GetOrderResponseDto extends createZodDto(
  ResponseSchema(GetOrderResponseSchema),
) {}

export class DashboardSellerResponseDto extends createZodDto(
  ResponseSchema(DashboardSellerResponseSchema),
) {}
