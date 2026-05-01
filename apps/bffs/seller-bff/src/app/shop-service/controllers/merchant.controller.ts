import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetMerchantRequestDto,
  GetMerchantResponseDto,
} from '@common/interfaces/dtos/shop';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MerchantService } from '../services/merchant.service';

@Controller('shop/merchant')
@ApiTags('Shop/Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

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
}
