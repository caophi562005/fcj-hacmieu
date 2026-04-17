import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateReportRequestSchema,
  GetManyReportsRequestSchema,
  GetManyReportsResponseSchema,
  GetReportRequestSchema,
  ReportResponseSchema,
  ResolveReportRequestSchema,
  UpdateReportRequestSchema,
} from '@common/interfaces/models/utility';
import { createZodDto } from 'nestjs-zod';

export class GetManyReportsRequestDto extends createZodDto(
  GetManyReportsRequestSchema,
) {}

export class GetReportRequestDto extends createZodDto(GetReportRequestSchema) {}

export class CreateReportRequestDto extends createZodDto(
  CreateReportRequestSchema,
) {}

export class UpdateReportRequestDto extends createZodDto(
  UpdateReportRequestSchema,
) {}

export class ResolveReportRequestDto extends createZodDto(
  ResolveReportRequestSchema,
) {}

export class GetManyReportsResponseDto extends createZodDto(
  ResponseSchema(GetManyReportsResponseSchema),
) {}

export class ReportResponseDto extends createZodDto(
  ResponseSchema(ReportResponseSchema),
) {}
