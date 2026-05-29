import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateMerchantRequestDto,
  GetMerchantRequestDto,
  GetMerchantResponseDto,
} from '@common/interfaces/dtos/shop';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MerchantService } from '../services/merchant.service';

@Controller('shop/merchant')
@ApiTags('Shop/Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('me')
  @ApiOkResponse({
    type: GetMerchantResponseDto,
  })
  async getMyMerchant(
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    const res = await this.merchantService.getManyMerchants({
      processId,
      userId,
      page: 1,
      limit: 1,
    });
    return {
      status: 200,
      message: 'Lấy thông tin merchant thành công',
      data: res.merchants?.[0] ?? null,
    };
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
