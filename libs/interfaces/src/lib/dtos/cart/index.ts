import {
  AddCartItemRequestSchema,
  AddCartItemResponseSchema,
  DeleteCartItemRequestSchema,
  DeleteCartItemResponseSchema,
  GetManyCartItemsRequestSchema,
  GetManyCartItemsResponseSchema,
  UpdateCartItemRequestSchema,
} from '@common/interfaces/models/cart';
import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import { createZodDto } from 'nestjs-zod';

export class AddCartItemRequestDto extends createZodDto(
  AddCartItemRequestSchema
) {}

export class UpdateCartItemRequestDto extends createZodDto(
  UpdateCartItemRequestSchema
) {}

export class DeleteCartItemRequestDto extends createZodDto(
  DeleteCartItemRequestSchema
) {}

export class GetManyCartItemsRequestDto extends createZodDto(
  GetManyCartItemsRequestSchema
) {}

//====================================================================================
export class AddCartItemResponseDto extends createZodDto(
  ResponseSchema(AddCartItemResponseSchema)
) {}

export class DeleteCartItemResponseDto extends createZodDto(
  ResponseSchema(DeleteCartItemResponseSchema)
) {}

export class GetManyCartItemsResponseDto extends createZodDto(
  ResponseSchema(GetManyCartItemsResponseSchema)
) {}
