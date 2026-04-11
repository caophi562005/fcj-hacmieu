import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  DeleteShopRequestDto,
  GetManyShopsRequestDto,
  GetManyShopsResponseDto,
  GetShopRequestDto,
  GetShopResponseDto,
  UpdateShopRequestDto,
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
import { ShopService } from '../services/shop.service';

@Controller('shop/shop')
@ApiTags('Shop/Shop')
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
    type: GetShopResponseDto,
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

  @Put()
  @ApiOkResponse({
    type: GetShopResponseDto,
  })
  async updateShop(
    @Body() body: UpdateShopRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.shopService.updateShop({
      ...body,
      processId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: GetShopResponseDto,
  })
  async deleteShop(
    @Param() params: DeleteShopRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.shopService.deleteShop({
      ...params,
      processId,
      deletedById: userId,
    });
  }
}
