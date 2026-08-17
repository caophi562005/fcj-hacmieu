import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  GetSellerSettlementByIdRequestDto,
  GetSellerSettlementSummaryResponseDto,
  GetSellerSettlementsRequestDto,
  GetSellerSettlementsResponseDto,
  SellerSettlementDetailResponseDto,
} from '@common/interfaces/dtos/wallet';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SettlementService } from '../services/settlement.service';

@Controller('wallet/settlements')
@ApiTags('Wallet/Settlements')
export class SettlementController {
  constructor(private readonly service: SettlementService) {}

  @Get('summary')
  @ApiOkResponse({ type: GetSellerSettlementSummaryResponseDto })
  getSummary(
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) throw new BadRequestException('Shop ID is required');
    return this.service.getSummary({ processId, shopId });
  }

  @Get()
  @ApiOkResponse({ type: GetSellerSettlementsResponseDto })
  getMany(
    @Query() query: GetSellerSettlementsRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) throw new BadRequestException('Shop ID is required');
    return this.service.getMany({ ...query, processId, shopId });
  }

  @Get(':settlementId')
  @ApiOkResponse({ type: SellerSettlementDetailResponseDto })
  getById(
    @Param() param: GetSellerSettlementByIdRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) throw new BadRequestException('Shop ID is required');
    return this.service.getById({ ...param, processId, shopId });
  }
}
