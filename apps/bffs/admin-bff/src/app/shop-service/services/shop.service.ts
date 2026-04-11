import {
  CreateShopRequest,
  DeleteShopRequest,
  GetManyShopsRequest,
  GetManyShopsResponse,
  GetShopRequest,
  SHOP_MODULE_SERVICE_NAME,
  SHOP_SERVICE_PACKAGE_NAME,
  ShopModuleClient,
  ShopResponse,
  UpdateShopRequest,
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

  async getShop(data: GetShopRequest): Promise<ShopResponse> {
    return firstValueFrom(this.shopModule.getShop(data));
  }

  async createShop(data: CreateShopRequest): Promise<ShopResponse> {
    return firstValueFrom(this.shopModule.createShop(data));
  }

  async updateShop(data: UpdateShopRequest): Promise<ShopResponse> {
    return firstValueFrom(this.shopModule.updateShop(data));
  }

  async deleteShop(data: DeleteShopRequest): Promise<ShopResponse> {
    return firstValueFrom(this.shopModule.deleteShop(data));
  }
}
