import { ResponseSchema } from '../../models/common/response.model';
import {
  CreateMarketingCampaignRequestSchema,
  GetManyMarketingCampaignsRequestSchema,
  GetManyMarketingCampaignsResponseSchema,
  MarketingCampaignResponseSchema,
  MarketingOperationResponseSchema,
} from '../../models/promotion';
import { createZodDto } from 'nestjs-zod';

export class CreateMarketingCampaignRequestDto extends createZodDto(
  CreateMarketingCampaignRequestSchema.omit({
    processId: true,
    createdById: true,
  }),
) {}

export class GetManyMarketingCampaignsRequestDto extends createZodDto(
  GetManyMarketingCampaignsRequestSchema.omit({ processId: true }),
) {}

export class MarketingCampaignResponseDto extends createZodDto(
  ResponseSchema(MarketingCampaignResponseSchema),
) {}

export class GetManyMarketingCampaignsResponseDto extends createZodDto(
  ResponseSchema(GetManyMarketingCampaignsResponseSchema),
) {}

export class MarketingOperationResponseDto extends createZodDto(
  ResponseSchema(MarketingOperationResponseSchema),
) {}
