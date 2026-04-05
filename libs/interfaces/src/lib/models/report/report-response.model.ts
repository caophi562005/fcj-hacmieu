import {
  ReportCategoryEnums,
  ReportStatusEnums,
  ReportTargetEnums,
} from '@common/constants/report.constant';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const CreateReportResponseSchema = z.object({
  ReportId: z.uuid(),
  ReporterId: z.uuid(),
  TargetId: z.uuid(),
  TargetType: z.number(),
  Category: z.number(),
  Title: z.string(),
  Description: z.string(),
  Status: z.string(),
  CreatedAt: z.any(),
});

export const UpdateStatusReportResponseSchema = z.object({
  ReportId: z.uuid(),
  OldStatus: z.string(),
  NewStatus: z.string(),
  AdminId: z.string(),
  Note: z.string().optional(),
  UpdatedAt: z.any(),
});

export const ReportResponseSchema = z.object({
  id: z.uuid(),
  reporterId: z.uuid(),
  targetId: z.uuid(),
  targetType: ReportTargetEnums,
  category: ReportCategoryEnums,
  title: z.string(),
  description: z.string(),
  status: ReportStatusEnums,
  note: z.string().optional(),
  createdAt: z.any(),
  updatedAt: z.any().optional(),
});

export const GetManyReportsResponseSchema =
  PaginationQueryResponseSchema.extend({
    reports: z.array(
      ReportResponseSchema.omit({
        targetId: true,
        description: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      })
    ),
  });

export type CreateReportResponse = z.infer<typeof CreateReportResponseSchema>;
export type UpdateStatusReportResponse = z.infer<
  typeof UpdateStatusReportResponseSchema
>;
export type GetManyReportsResponse = z.infer<
  typeof GetManyReportsResponseSchema
>;
export type ReportResponse = z.infer<typeof ReportResponseSchema>;
