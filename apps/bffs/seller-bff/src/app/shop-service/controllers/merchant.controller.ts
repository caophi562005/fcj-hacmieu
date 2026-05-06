import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import { GetMerchantResponseDto } from '@common/interfaces/dtos/shop';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MerchantService } from '../services/merchant.service';

@Controller('shop/merchant')
@ApiTags('Shop/Merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  @ApiOkResponse({
    type: GetMerchantResponseDto,
  })
  async getMerchant(
    @ProcessId() processId: string,
    @UserData('merchantId') merchantId: string,
  ) {
    return this.merchantService.getMerchant({
      id: merchantId,
      processId,
    });
  }
}
