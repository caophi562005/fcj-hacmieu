import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

const ReportTargetTypeSchema = z.enum([
  'USER',
  'SELLER',
  'PRODUCT',
  'ORDER',
  'MESSAGE',
  'REVIEW',
]);

const ReportCategorySchema = z.enum([
  'SCAM',
  'FRAUD',
  'FAKE',
  'HARASSMENT',
  'SPAM',
  'OTHER',
]);

const ReportStatusSchema = z.enum([
  'PENDING',
  'REVIEWING',
  'RESOLVED',
  'REJECTED',
]);

export const GetManyReportsRequestSchema = PaginationQueryRequestSchema.extend({
  userId: z.uuid().optional(),
  status: ReportStatusSchema.optional(),
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const GetReportRequestSchema = z
  .object({
    id: z.uuid(),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateReportRequestSchema = z
  .object({
    reporterId: z.uuid(),
    targetType: ReportTargetTypeSchema,
    targetId: z.uuid(),
    category: ReportCategorySchema,
    title: z.string().max(200),
    description: z.string().max(2000),
    media: z.array(z.string().url()).default([]),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateReportRequestSchema = z
  .object({
    id: z.uuid(),
    status: ReportStatusSchema,
    assigneeAdminId: z.uuid().optional(),
    action: z.string().max(1000).optional(),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const ResolveReportRequestSchema = z
  .object({
    id: z.uuid(),
    action: z.string().max(1000).optional(),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteReportRequestSchema = z
  .object({
    id: z.uuid(),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyReportsRequest = z.infer<typeof GetManyReportsRequestSchema>;
export type GetReportRequest = z.infer<typeof GetReportRequestSchema>;
export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;
export type UpdateReportRequest = z.infer<typeof UpdateReportRequestSchema>;
export type ResolveReportRequest = z.infer<typeof ResolveReportRequestSchema>;
export type DeleteReportRequest = z.infer<typeof DeleteReportRequestSchema>;
