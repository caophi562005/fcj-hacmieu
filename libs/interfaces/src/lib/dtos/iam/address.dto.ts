import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  AddressResponseSchema,
  CreateAddressRequestSchema,
  DeleteAddressRequestSchema,
  GetAddressRequestSchema,
  GetManyAddressesRequestSchema,
  GetManyAddressesResponseSchema,
  UpdateAddressRequestSchema,
} from '@common/interfaces/models/iam';
import { createZodDto } from 'nestjs-zod';

export class GetManyAddressesRequestDto extends createZodDto(
  GetManyAddressesRequestSchema.omit({
    processId: true,
    userId: true,
  }),
) {}

export class GetAddressRequestDto extends createZodDto(
  GetAddressRequestSchema.omit({
    processId: true,
    userId: true,
  }),
) {}

export class CreateAddressRequestDto extends createZodDto(
  CreateAddressRequestSchema.omit({
    processId: true,
    userId: true,
  }),
) {}

export class UpdateAddressRequestDto extends createZodDto(
  UpdateAddressRequestSchema.omit({
    processId: true,
    userId: true,
  }),
) {}

export class DeleteAddressRequestDto extends createZodDto(
  DeleteAddressRequestSchema.omit({
    processId: true,
    userId: true,
  }),
) {}

// ====================================================================================================

export class GetManyAddressesResponseDto extends createZodDto(
  ResponseSchema(GetManyAddressesResponseSchema),
) {}

export class GetAddressResponseDto extends createZodDto(
  ResponseSchema(AddressResponseSchema),
) {}
