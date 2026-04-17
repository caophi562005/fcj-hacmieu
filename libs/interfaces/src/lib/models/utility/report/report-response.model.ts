import z from 'zod';

const ReportStatusSchema = z.enum([
  'PENDING',
  'REVIEWING',
  'RESOLVED',
  'REJECTED',
]);

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

export const ReportResponseSchema = z.object({
  id: z.uuid(),
  reporterId: z.uuid(),
  targetType: ReportTargetTypeSchema,
  targetId: z.uuid(),
  category: ReportCategorySchema,
  title: z.string(),
  description: z.string(),
  status: ReportStatusSchema,
  assigneeAdminId: z.uuid().optional(),
  closedAt: z.date().optional(),
  media: z.array(z.string().url()),
  action: z.string().optional(),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetManyReportsResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
  reports: z.array(ReportResponseSchema),
});

export type ReportResponse = z.infer<typeof ReportResponseSchema>;
export type GetManyReportsResponse = z.infer<
  typeof GetManyReportsResponseSchema
>;
