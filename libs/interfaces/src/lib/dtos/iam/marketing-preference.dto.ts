import { ResponseSchema } from '../../models/common/response.model';
import {
  GetMarketingRecipientsResponseSchema,
  GetMarketingPreferencesRequestSchema,
  MarketingPreferencesResponseSchema,
  UpdateMarketingPreferencesRequestSchema,
} from '../../models/iam';
import { createZodDto } from 'nestjs-zod';

export class GetMarketingPreferencesRequestDto extends createZodDto(
  GetMarketingPreferencesRequestSchema.omit({ processId: true, userId: true }),
) {}

export class UpdateMarketingPreferencesRequestDto extends createZodDto(
  UpdateMarketingPreferencesRequestSchema.omit({
    processId: true,
    userId: true,
  }),
) {}

export class MarketingPreferencesResponseDto extends createZodDto(
  ResponseSchema(MarketingPreferencesResponseSchema),
) {}

export class GetMarketingRecipientsResponseDto extends createZodDto(
  ResponseSchema(GetMarketingRecipientsResponseSchema),
) {}
