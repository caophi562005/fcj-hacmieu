import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  AdjustWalletRequestDto,
  GetMyTransactionsRequestDto,
  GetMyTransactionsResponseDto,
  WalletResponseDto,
} from '@common/interfaces/dtos/wallet';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from '../services/wallet.service';

@Controller('wallet')
@ApiTags('Wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @ApiOkResponse({ type: WalletResponseDto })
  async getMyWallet(
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.walletService.getMyWallet({ userId, processId });
  }

  @Get('transactions')
  @ApiOkResponse({ type: GetMyTransactionsResponseDto })
  async getMyTransactions(
    @Query() query: GetMyTransactionsRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.walletService.getMyTransactions({
      ...query,
      userId,
      processId,
    });
  }

  @Post('adjust')
  @ApiOkResponse({ type: WalletResponseDto })
  async adjustWallet(
    @Body() body: AdjustWalletRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.walletService.adjustWallet({
      ...body,
      userId,
      processId,
    });
  }
}
