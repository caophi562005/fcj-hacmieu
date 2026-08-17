import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  GetSellerSettlementByIdRequestDto,
  GetSellerSettlementSummaryRequestDto,
  GetSellerSettlementSummaryResponseDto,
  GetSellerSettlementsRequestDto,
  GetSellerSettlementsResponseDto,
  SellerSettlementDetailResponseDto,
  UpdateSellerSettlementStatusRequestDto,
} from '@common/interfaces/dtos/wallet';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SettlementService } from '../services/settlement.service';

@Controller('admin/settlements')
@ApiTags('Admin/Settlements')
export class SettlementController {
  constructor(private readonly service: SettlementService) {}

  @Get('summary')
  @ApiOkResponse({ type: GetSellerSettlementSummaryResponseDto })
  getSummary(
    @Query() query: GetSellerSettlementSummaryRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.service.getSummary({ ...query, processId });
  }

  @Get()
  @ApiOkResponse({ type: GetSellerSettlementsResponseDto })
  getMany(
    @Query() query: GetSellerSettlementsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.service.getMany({ ...query, processId });
  }

  @Get(':settlementId')
  @ApiOkResponse({ type: SellerSettlementDetailResponseDto })
  getById(
    @Param() param: GetSellerSettlementByIdRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.service.getById({ ...param, processId });
  }

  @Patch(':settlementId/action')
  @ApiOkResponse({ type: SellerSettlementDetailResponseDto })
  updateStatus(
    @Param() param: GetSellerSettlementByIdRequestDto,
    @Body() body: UpdateSellerSettlementStatusRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') actorId: string,
  ) {
    return this.service.updateStatus({ ...body, ...param, processId, actorId });
  }
}
