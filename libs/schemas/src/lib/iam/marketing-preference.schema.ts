import { MarketingTopicEnums } from '@common/constants/user.constant';
import { z } from 'zod';

export const MarketingPreferenceSchema = z.object({
  userId: z.uuid(),
  topic: MarketingTopicEnums,
  optedIn: z.boolean(),
  consentVersion: z.string().nullable().optional(),
  consentSource: z.string().nullable().optional(),
  consentedAt: z.any().nullable().optional(),
  withdrawnAt: z.any().nullable().optional(),
});
