import z from 'zod';
import { BaseSchema } from '../common/base.schema';

export enum ReportTargetTypeEnums {
  USER = 'USER',
  SELLER = 'SELLER',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  MESSAGE = 'MESSAGE',
  REVIEW = 'REVIEW',
}

export enum ReportCategoryEnums {
  SCAM = 'SCAM',
  FRAUD = 'FRAUD',
  FAKE = 'FAKE',
  HARASSMENT = 'HARASSMENT',
  SPAM = 'SPAM',
  OTHER = 'OTHER',
}

export enum ReportStatusEnums {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

const ReportTargetTypeSchema = z.enum([
  ReportTargetTypeEnums.USER,
  ReportTargetTypeEnums.SELLER,
  ReportTargetTypeEnums.PRODUCT,
  ReportTargetTypeEnums.ORDER,
  ReportTargetTypeEnums.MESSAGE,
  ReportTargetTypeEnums.REVIEW,
]);

const ReportCategorySchema = z.enum([
  ReportCategoryEnums.SCAM,
  ReportCategoryEnums.FRAUD,
  ReportCategoryEnums.FAKE,
  ReportCategoryEnums.HARASSMENT,
  ReportCategoryEnums.SPAM,
  ReportCategoryEnums.OTHER,
]);

const ReportStatusSchema = z.enum([
  ReportStatusEnums.PENDING,
  ReportStatusEnums.REVIEWING,
  ReportStatusEnums.RESOLVED,
  ReportStatusEnums.REJECTED,
]);

export const ReportSchema = BaseSchema.extend({
  reporterId: z.uuid(),
  targetType: ReportTargetTypeSchema,
  targetId: z.uuid(),
  category: ReportCategorySchema,
  title: z.string().max(200),
  description: z.string().max(2000),
  status: ReportStatusSchema.default(ReportStatusEnums.PENDING),
  assigneeAdminId: z.uuid().optional(),
  closedAt: z.date().optional(),
  media: z.array(z.string().url()).default([]),
  action: z.string().max(1000).optional(),
});

export type ReportTargetType = z.infer<typeof ReportTargetTypeSchema>;
export type ReportCategory = z.infer<typeof ReportCategorySchema>;
export type ReportStatus = z.infer<typeof ReportStatusSchema>;
export type Report = z.infer<typeof ReportSchema>;
