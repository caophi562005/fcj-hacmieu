import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  ClaimPromotionRequestDto,
  GetMyVouchersRequestDto,
  GetMyVouchersResponseDto,
  PromotionRedemptionResponseDto,
} from '@common/interfaces/dtos/promotion';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RedemptionService } from '../services/redemption.service';

@Controller('promotion/voucher')
@ApiTags('Promotion/Voucher')
export class RedemptionController {
  constructor(private readonly redemptionService: RedemptionService) {}

  @Post('claim')
  @ApiOkResponse({ type: PromotionRedemptionResponseDto })
  async claim(
    @Body() body: ClaimPromotionRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.redemptionService.claimPromotion({
      ...body,
      userId,
      processId,
    });
  }

  @Get()
  @ApiOkResponse({ type: GetMyVouchersResponseDto })
  async getMyVouchers(
    @Query() query: GetMyVouchersRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.redemptionService.getMyVouchers({
      ...query,
      userId,
      processId,
    });
  }
}
