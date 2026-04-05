import { z } from 'zod';

export const ReportTargetValues = {
  USER: 'USER',
  SELLER: 'SELLER',
  PRODUCT: 'PRODUCT',
  ORDER: 'ORDER',
  MESSAGE: 'MESSAGE',
  REVIEW: 'REVIEW',
} as const;

export const ReportTargetEnums = z.enum([
  ReportTargetValues.USER,
  ReportTargetValues.SELLER,
  ReportTargetValues.PRODUCT,
  ReportTargetValues.ORDER,
  ReportTargetValues.MESSAGE,
  ReportTargetValues.REVIEW,
]);

export const ReportCategoryValues = {
  SCAM: 'SCAM',
  FRAUD: 'FRAUD',
  FAKE: 'FAKE',
  HARASSMENT: 'HARASSMENT',
  SPAM: 'SPAM',
} as const;

export const ReportCategoryEnums = z.enum([
  ReportCategoryValues.SCAM,
  ReportCategoryValues.FRAUD,
  ReportCategoryValues.FAKE,
  ReportCategoryValues.HARASSMENT,
  ReportCategoryValues.SPAM,
]);

export const ReportStatusValues = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const;

export const ReportStatusEnums = z.enum([
  ReportStatusValues.PENDING,
  ReportStatusValues.REVIEWING,
  ReportStatusValues.RESOLVED,
  ReportStatusValues.REJECTED,
]);

export const ReportActionValues = {
  WARNING: 'WARNING',
  BAN_USER: 'BAN_USER',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  REJECT: 'REJECT',
} as const;

export const ReportActionEnums = z.enum([
  ReportActionValues.WARNING,
  ReportActionValues.BAN_USER,
  ReportActionValues.DELETE_PRODUCT,
  ReportActionValues.REJECT,
]);

export type ReportStatusType = z.infer<typeof ReportStatusEnums>;
export type ReportActionType = z.infer<typeof ReportActionEnums>;
