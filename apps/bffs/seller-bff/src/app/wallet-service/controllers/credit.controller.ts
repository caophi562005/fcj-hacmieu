import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  AdjustShopCreditRequestDto,
  CreditResponseDto,
  GetShopCreditTransactionsRequestDto,
  GetShopCreditTransactionsResponseDto,
  GetShopRevenueSummaryRequestDto,
  GetShopRevenueSummaryResponseDto,
} from '@common/interfaces/dtos/wallet';
import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreditService } from '../services/credit.service';

@Controller('wallet/credit')
@ApiTags('Wallet/Credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get('me')
  @ApiOkResponse({ type: CreditResponseDto })
  async getShopCredit(
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) {
      throw new BadRequestException('Shop ID is required');
    }
    return this.creditService.getShopCredit({ shopId, processId });
  }

  @Get('transactions')
  @ApiOkResponse({ type: GetShopCreditTransactionsResponseDto })
  async getShopCreditTransactions(
    @Query() query: GetShopCreditTransactionsRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) throw new BadRequestException('Shop ID is required');
    return this.creditService.getShopCreditTransactions({
      ...query,
      shopId,
      processId,
    });
  }

  @Get('revenue-summary')
  @ApiOkResponse({ type: GetShopRevenueSummaryResponseDto })
  async getShopRevenueSummary(
    @Query() query: GetShopRevenueSummaryRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) throw new BadRequestException('Shop ID is required');
    return this.creditService.getShopRevenueSummary({
      ...query,
      shopId,
      processId,
    });
  }

  @Post('adjust')
  @ApiOkResponse({ type: CreditResponseDto })
  async adjustShopCredit(
    @Body() body: AdjustShopCreditRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) throw new BadRequestException('Shop ID is required');
    return this.creditService.adjustShopCredit({
      ...body,
      shopId,
      processId,
    });
  }
}
