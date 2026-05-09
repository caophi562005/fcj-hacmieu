import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateShopPayoutRequestDto,
  DeleteShopPayoutRequestDto,
  GetShopPayoutByIdRequestDto,
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

  @Post('request')
  @ApiOkResponse({ type: ShopPayoutResponseDto })
  async createShopPayout(
    @Body() body: CreateShopPayoutRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.payoutService.createShopPayout({
      ...body,
      shopId,
      processId,
    });
  }

  @Get(':payoutId')
  @ApiOkResponse({ type: ShopPayoutResponseDto })
  async getShopPayoutById(
    @Param() param: GetShopPayoutByIdRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.payoutService.getShopPayoutById({
      ...param,
      shopId,
      processId,
    });
  }

  @Get()
  @ApiOkResponse({ type: GetShopPayoutsResponseDto })
  async getShopPayouts(
    @Query() query: GetShopPayoutsRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.payoutService.getShopPayouts({
      ...query,
      shopId,
      processId,
    });
  }

  @Patch(':payoutId/status')
  @ApiOkResponse({ type: ShopPayoutResponseDto })
  async updateShopPayoutStatus(
    @Param() param: GetShopPayoutByIdRequestDto,
    @Body() body: UpdateShopPayoutStatusRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.payoutService.updateShopPayoutStatus({
      ...body,
      payoutId: param.payoutId,
      shopId,
      processId,
    });
  }

  @Delete(':payoutId')
  @ApiOkResponse({ type: ShopPayoutResponseDto })
  async deleteShopPayout(
    @Param() param: DeleteShopPayoutRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.payoutService.deleteShopPayout({
      ...param,
      shopId,
      processId,
    });
  }
}
