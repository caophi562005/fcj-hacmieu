import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  CreateShopPayoutRequestDto,
  GetShopPayoutsRequestDto,
  GetShopPayoutsResponseDto,
  ShopPayoutResponseDto,
  UpdateShopPayoutStatusRequestDto,
} from '@common/interfaces/dtos/wallet';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PayoutService } from '../services/payout.service';

@Controller('wallet/payout')
@ApiTags('Wallet/Payout')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  @ApiOkResponse({ type: GetShopPayoutsResponseDto })
  async getManyPayouts(
    @Query() queries: GetShopPayoutsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.payoutService.getShopPayouts({
      ...queries,
      processId,
    });
  }

  @Post(':shopId/request')
  @ApiOkResponse({ type: ShopPayoutResponseDto })
  async createShopPayout(
    @Body() body: CreateShopPayoutRequestDto,
    @Param('shopId') shopId: string,
    @ProcessId() processId: string,
  ) {
    return this.payoutService.createShopPayout({
      ...body,
      shopId,
      processId,
    });
  }

  @Get(':shopId/:payoutId')
  @ApiOkResponse({ type: ShopPayoutResponseDto })
  async getShopPayoutById(
    @Param('shopId') shopId: string,
    @Param('payoutId') payoutId: string,
    @ProcessId() processId: string,
  ) {
    return this.payoutService.getShopPayoutById({
      shopId,
      payoutId,
      processId,
    });
  }

  @Get(':shopId')
  @ApiOkResponse({ type: GetShopPayoutsResponseDto })
  async getShopPayouts(
    @Param('shopId') shopId: string,
    @Query() queries: GetShopPayoutsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.payoutService.getShopPayouts({
      shopId,
      ...queries,
      processId,
    });
  }

  @Patch(':shopId/:payoutId/status')
  @ApiOkResponse({ type: ShopPayoutResponseDto })
  async updateShopPayoutStatus(
    @Param('shopId') shopId: string,
    @Param('payoutId') payoutId: string,
    @Body()
    body: UpdateShopPayoutStatusRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.payoutService.updateShopPayoutStatus({
      ...body,
      shopId,
      payoutId,
      processId,
    });
  }

  @Delete(':shopId/:payoutId')
  @ApiOkResponse({ type: ShopPayoutResponseDto })
  async deleteShopPayout(
    @Param('shopId') shopId: string,
    @Param('payoutId') payoutId: string,
    @ProcessId() processId: string,
  ) {
    return this.payoutService.deleteShopPayout({
      shopId,
      payoutId,
      processId,
    });
  }
}
