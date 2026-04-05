import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateReportRequestSchema,
  DeleteReportRequestSchema,
  GetManyReportsRequestSchema,
  GetManyReportsResponseSchema,
  GetReportRequestSchema,
  ReportResponseSchema,
  UpdateReportStatusRequestSchema,
} from '@common/interfaces/models/report';
import { createZodDto } from 'nestjs-zod';

export class CreateReportRequestDto extends createZodDto(
  CreateReportRequestSchema.omit({ processId: true })
) {}

export class UpdateReportStatusRequestDto extends createZodDto(
  UpdateReportStatusRequestSchema.omit({ processId: true })
) {}

export class DeleteReportRequestDto extends createZodDto(
  DeleteReportRequestSchema.omit({ processId: true })
) {}

export class GetManyReportsRequestDto extends createZodDto(
  GetManyReportsRequestSchema.omit({ processId: true })
) {}

export class GetReportRequestDto extends createZodDto(
  GetReportRequestSchema.omit({ processId: true })
) {}

// =================================================================================
export class ReportResponseDto extends createZodDto(
  ResponseSchema(ReportResponseSchema)
) {}

export class GetManyReportsResponseDto extends createZodDto(
  ResponseSchema(GetManyReportsResponseSchema)
) {}
