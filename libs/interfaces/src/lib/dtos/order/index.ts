import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  AddCartItemRequestSchema,
  AddCartItemResponseSchema,
  CancelOrderRequestSchema,
  CartItemResponseSchema,
  CreateOrderRequestSchema,
  CreateOrderResponseSchema,
  DashboardSellerRequestSchema,
  DashboardSellerResponseSchema,
  DeleteCartItemRequestSchema,
  DeleteCartItemResponseSchema,
  GetManyCartItemsRequestSchema,
  GetManyCartItemsResponseSchema,
  GetManyOrdersRequestSchema,
  GetManyOrdersResponseSchema,
  GetOrderRequestSchema,
  GetOrderResponseSchema,
  UpdateCartItemRequestSchema,
  UpdateStatusOrderRequestSchema,
  ValidateCartItemsRequestSchema,
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

export class GetManyCartItemsRequestDto extends createZodDto(
  GetManyCartItemsRequestSchema.omit({ processId: true, userId: true }),
) {}

export class AddCartItemRequestDto extends createZodDto(
  AddCartItemRequestSchema.omit({ processId: true, userId: true }),
) {}

export class UpdateCartItemRequestDto extends createZodDto(
  UpdateCartItemRequestSchema.omit({ processId: true, userId: true }),
) {}

export class DeleteCartItemRequestDto extends createZodDto(
  DeleteCartItemRequestSchema.omit({ processId: true, userId: true }),
) {}

export class ValidateCartItemsRequestDto extends createZodDto(
  ValidateCartItemsRequestSchema.omit({ processId: true, userId: true }),
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

export class CartItemResponseDto extends createZodDto(
  ResponseSchema(CartItemResponseSchema),
) {}

export class AddCartItemResponseDto extends createZodDto(
  ResponseSchema(AddCartItemResponseSchema),
) {}

export class DeleteCartItemResponseDto extends createZodDto(
  ResponseSchema(DeleteCartItemResponseSchema),
) {}

export class GetManyCartItemsResponseDto extends createZodDto(
  ResponseSchema(GetManyCartItemsResponseSchema),
) {}
