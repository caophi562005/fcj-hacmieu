import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateMarketingCampaignRequestDto,
  GetManyMarketingCampaignsRequestDto,
  GetManyMarketingCampaignsResponseDto,
  MarketingCampaignResponseDto,
  MarketingOperationResponseDto,
} from '@common/interfaces/dtos/promotion';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MarketingService } from '../services/marketing.service';

@Controller('promotion/marketing')
@ApiTags('Promotion/Marketing')
export class MarketingController {
  constructor(private readonly service: MarketingService) {}

  @Get()
  @ApiOkResponse({ type: GetManyMarketingCampaignsResponseDto })
  list(
    @Query() query: GetManyMarketingCampaignsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.service.list({ ...query, processId });
  }

  @Get(':id')
  @ApiOkResponse({ type: MarketingCampaignResponseDto })
  find(@Param('id') id: string, @ProcessId() processId: string) {
    return this.service.find({ id, processId });
  }

  @Post()
  @ApiOkResponse({ type: MarketingCampaignResponseDto })
  create(
    @Body() body: CreateMarketingCampaignRequestDto,
    @UserData('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.service.create({ ...body, createdById: userId, processId });
  }

  @Post(':id/dispatch')
  @ApiOkResponse({ type: MarketingOperationResponseDto })
  dispatch(@Param('id') id: string, @ProcessId() processId: string) {
    return this.service.dispatch({ id, processId });
  }

  @Post('scan/run')
  @ApiOkResponse({ type: MarketingOperationResponseDto })
  scan(@ProcessId() processId: string) {
    return this.service.scan({ processId });
  }

  @Post('webhooks/resend')
  @IsPublic()
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @ProcessId() processId: string,
  ) {
    return this.service.webhook({
      processId,
      payload:
        request.rawBody?.toString('utf8') || JSON.stringify(request.body),
      svixId,
      svixTimestamp,
      svixSignature,
    });
  }
}
