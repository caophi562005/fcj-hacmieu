import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  CreditResponseDto,
  GetShopCreditTransactionsRequestDto,
  GetShopCreditTransactionsResponseDto,
  GetShopRevenueSummaryResponseDto,
} from '@common/interfaces/dtos/wallet';
import {
  AdjustShopCreditRequest,
  GetShopRevenueSummaryRequest,
} from '@common/interfaces/proto-types/wallet';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreditService } from '../services/credit.service';

@Controller('wallet/credit')
@ApiTags('Wallet/Credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get(':shopId')
  @ApiOkResponse({ type: CreditResponseDto })
  async getShopCredit(
    @Param('shopId') shopId: string,
    @ProcessId() processId: string,
  ) {
    return this.creditService.getShopCredit({ shopId, processId });
  }

  @Get(':shopId/transactions')
  @ApiOkResponse({ type: GetShopCreditTransactionsResponseDto })
  async getShopCreditTransactions(
    @Query() queries: GetShopCreditTransactionsRequestDto,
    @Param('shopId') shopId: string,
    @ProcessId() processId: string,
  ) {
    return this.creditService.getShopCreditTransactions({
      ...queries,
      shopId,
      processId,
    });
  }

  @Get(':shopId/revenue-summary')
  @ApiOkResponse({ type: GetShopRevenueSummaryResponseDto })
  async getShopRevenueSummary(
    @Param('shopId') shopId: string,
    @Query('days') daysRaw: string,
    @ProcessId() processId: string,
  ) {
    const days = Math.max(1, Number(daysRaw) || 7);

    return this.creditService.getShopRevenueSummary({
      shopId,
      days,
      processId,
    } as GetShopRevenueSummaryRequest);
  }

  @Post('adjust')
  @ApiOkResponse({ type: CreditResponseDto })
  async adjustShopCredit(
    @Body() body: Omit<AdjustShopCreditRequest, 'processId'>,
    @ProcessId() processId: string,
  ) {
    return this.creditService.adjustShopCredit({
      ...body,
      processId,
    });
  }
}
