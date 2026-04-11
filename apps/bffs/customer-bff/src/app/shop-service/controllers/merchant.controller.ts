import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateMerchantRequestDto,
  GetManyMerchantsRequestDto,
  GetManyMerchantsResponseDto,
  GetMerchantRequestDto,
  GetMerchantResponseDto,
} from '@common/interfaces/dtos/shop';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MerchantService } from '../services/merchant.service';

@Controller('shop/merchant')
@ApiTags('Shop/Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyMerchantsResponseDto,
  })
  async getManyMerchants(
    @Query() queries: GetManyMerchantsRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.merchantService.getManyMerchants({
      ...queries,
      processId,
      userId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: GetMerchantResponseDto,
  })
  async getMerchant(
    @Param() params: GetMerchantRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.merchantService.getMerchant({
      ...params,
      processId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: GetMerchantResponseDto,
  })
  async createMerchant(
    @Body() body: CreateMerchantRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.merchantService.createMerchant({
      ...body,
      processId,
      createdById: userId,
      userId,
    });
  }
}
