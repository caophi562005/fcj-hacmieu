import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateShopRequestDto,
  GetShopResponseDto,
  UpdateShopRequestDto,
} from '@common/interfaces/dtos/shop';
import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ShopService } from '../services/shop.service';

@Controller('shop/shop')
@ApiTags('Shop/Shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  @ApiOkResponse({
    type: GetShopResponseDto,
  })
  async getShop(
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.shopService.getShop({
      processId,
      id: shopId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: GetShopResponseDto,
  })
  async createShop(
    @Body() body: CreateShopRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
    @UserData('merchantId') merchantId: string,
  ) {
    return this.shopService.createShop({
      ...body,
      processId,
      merchantId,
      createdById: userId,
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
    @UserData('shopId') shopId: string,
  ) {
    return this.shopService.updateShop({
      ...body,
      processId,
      updatedById: userId,
      id: shopId,
    });
  }
}
