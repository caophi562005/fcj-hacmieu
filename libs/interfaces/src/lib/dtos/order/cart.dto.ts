import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  AddCartItemRequestSchema,
  AddCartItemResponseSchema,
  CartItemResponseSchema,
  DeleteCartItemRequestSchema,
  DeleteCartItemResponseSchema,
  GetManyCartItemsRequestSchema,
  GetManyCartItemsResponseSchema,
  UpdateCartItemRequestSchema,
  ValidateCartItemsRequestSchema,
} from '@common/interfaces/models/order';
import { createZodDto } from 'nestjs-zod';

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
