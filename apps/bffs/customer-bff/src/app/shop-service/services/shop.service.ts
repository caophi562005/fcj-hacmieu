import {
  GetManyShopsRequest,
  GetManyShopsResponse,
  GetShopRequest,
  SHOP_MODULE_SERVICE_NAME,
  SHOP_SERVICE_PACKAGE_NAME,
  ShopModuleClient,
} from '@common/interfaces/proto-types/shop';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShopService implements OnModuleInit {
  private shopModule!: ShopModuleClient;

  constructor(
    @Inject(SHOP_SERVICE_PACKAGE_NAME)
    private shopClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.shopModule = this.shopClient.getService<ShopModuleClient>(
      SHOP_MODULE_SERVICE_NAME,
    );
  }

  async getManyShops(data: GetManyShopsRequest): Promise<GetManyShopsResponse> {
    return firstValueFrom(this.shopModule.getManyShops(data));
  }

  async getShop(data: GetShopRequest) {
    const response = await firstValueFrom(this.shopModule.getShop(data));
    return {
      id: response.id,
      name: response.name,
      userId: response.userId,
      description: response.description,
      logo: response.logo,
      banner: response.banner,
      phone: response.phone,
      pickupAddress: response.pickupAddress,
      returnAddress: response.returnAddress,
      createdAt: response.createdAt,
    };
  }
}
