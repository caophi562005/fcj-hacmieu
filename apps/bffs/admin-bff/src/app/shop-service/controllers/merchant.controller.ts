import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  DeleteMerchantRequestDto,
  GetManyMerchantsRequestDto,
  GetManyMerchantsResponseDto,
  GetMerchantRequestDto,
  GetMerchantResponseDto,
  UpdateMerchantRequestDto,
} from '@common/interfaces/dtos/shop';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
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
  ) {
    return this.merchantService.getManyMerchants({
      ...queries,
      processId,
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

  @Put()
  @ApiOkResponse({
    type: GetMerchantResponseDto,
  })
  async updateMerchant(
    @Body() body: UpdateMerchantRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.merchantService.updateMerchant({
      ...body,
      processId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: GetMerchantResponseDto,
  })
  async deleteMerchant(
    @Param() params: DeleteMerchantRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.merchantService.deleteMerchant({
      ...params,
      processId,
      deletedById: userId,
    });
  }
}
