import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetMyTransactionsResponseDto,
  WalletResponseDto,
} from '@common/interfaces/dtos/wallet';
import {
  AdjustWalletRequest,
  GetMyTransactionsRequest,
} from '@common/interfaces/proto-types/wallet';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from '../services/wallet.service';

@Controller('wallet/wallet')
@ApiTags('Wallet/Wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId')
  @ApiOkResponse({ type: WalletResponseDto })
  async getWallet(
    @Param('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.walletService.getWallet({ userId, processId });
  }

  @Post('adjust')
  @ApiOkResponse({ type: WalletResponseDto })
  async adjustWallet(
    @Body() body: Omit<AdjustWalletRequest, 'processId'>,
    @ProcessId() processId: string,
  ) {
    return this.walletService.adjustWallet({ ...body, processId });
  }

  @Get(':userId/transactions')
  @ApiOkResponse({ type: GetMyTransactionsResponseDto })
  async getTransactions(
    @Param('userId') userId: string,
    @Query() queries: GetMyTransactionsRequest,
    @ProcessId() processId: string,
  ) {
    return this.walletService.getTransactions({
      ...queries,
      userId,
      processId,
    });
  }
}
