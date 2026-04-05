import {
  ReportCategoryEnums,
  ReportStatusEnums,
  ReportTargetEnums,
} from '@common/constants/report.constant';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetManyReportsRequestSchema = PaginationQueryRequestSchema.extend({
  reporterId: z.uuid().optional(),
  targetId: z.uuid().optional(),
  targetType: ReportTargetEnums.optional(),
  category: ReportCategoryEnums.optional(),
  status: ReportStatusEnums.optional(),
  processId: z.uuid().optional(),
}).strict();

export const GetReportRequestSchema = z
  .object({
    id: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateReportRequestSchema = z
  .object({
    reporterId: z.uuid(),
    targetId: z.uuid(),
    targetType: ReportTargetEnums,
    category: ReportCategoryEnums,
    title: z.string(),
    description: z.string().max(1000),
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateReportStatusRequestSchema = z.object({
  id: z.uuid(),
  adminId: z.uuid(),
  newStatus: ReportStatusEnums,
  note: z.string(),
  processId: z.uuid().optional(),
});

export const DeleteReportRequestSchema = z.object({
  id: z.uuid(),
  adminId: z.uuid(),
  processId: z.uuid().optional(),
});

export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;
export type GetManyReportsRequest = z.infer<typeof GetManyReportsRequestSchema>;
export type GetReportRequest = z.infer<typeof GetReportRequestSchema>;
export type UpdateReportStatusRequest = z.infer<
  typeof UpdateReportStatusRequestSchema
>;
export type DeleteReportRequest = z.infer<typeof DeleteReportRequestSchema>;
