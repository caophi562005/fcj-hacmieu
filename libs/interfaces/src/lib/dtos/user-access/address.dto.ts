import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  AddressResponseSchema,
  CreateAddressRequestSchema,
  DeleteAddressRequestSchema,
  GetAddressRequestSchema,
  GetManyAddressesRequestSchema,
  GetManyAddressesResponseSchema,
  UpdateAddressRequestSchema,
} from '@common/interfaces/models/user-access';
import { createZodDto } from 'nestjs-zod';

export class GetManyAddressesRequestDto extends createZodDto(
  GetManyAddressesRequestSchema
) {}

export class GetAddressRequestDto extends createZodDto(
  GetAddressRequestSchema
) {}

export class CreateAddressRequestDto extends createZodDto(
  CreateAddressRequestSchema
) {}

export class UpdateAddressRequestDto extends createZodDto(
  UpdateAddressRequestSchema
) {}

export class DeleteAddressRequestDto extends createZodDto(
  DeleteAddressRequestSchema
) {}

//=============================================================================================
export class GetManyAddressesResponseDto extends createZodDto(
  ResponseSchema(GetManyAddressesResponseSchema)
) {}

export class GetAddressResponseDto extends createZodDto(
  ResponseSchema(AddressResponseSchema)
) {}
