import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetManyShopsRequestDto,
  GetManyShopsResponseDto,
  GetShopRequestDto,
  GetShopResponseByUserDto,
} from '@common/interfaces/dtos/shop';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ShopService } from '../services/shop.service';

@Controller('shop/shop')
@ApiTags('Shop/Shop')
@IsPublic()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyShopsResponseDto,
  })
  async getManyShops(
    @Query() queries: GetManyShopsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.shopService.getManyShops({
      ...queries,
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: GetShopResponseByUserDto,
  })
  async getShop(
    @Param() params: GetShopRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.shopService.getShop({
      ...params,
      processId,
    });
  }
}
