import {
  GetManyShopsRequest,
  GetManyShopsResponse,
  GetShopRequest,
  SHOP_MODULE_SERVICE_NAME,
  SHOP_SERVICE_PACKAGE_NAME,
  ShopModuleClient,
} from '@common/interfaces/proto-types/shop';
import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
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
    const response = await firstValueFrom(this.shopModule.getManyShops(data));
    return {
      ...response,
      shops: response.shops.map((shop) => this.toPublicShop(shop)),
    } as GetManyShopsResponse;
  }

  async getShop(data: GetShopRequest) {
    const response = await firstValueFrom(this.shopModule.getShop(data));
    if (response.status !== 'ACTIVE') {
      throw new NotFoundException('Error.ShopNotFound');
    }
    return this.toPublicShop(response);
  }

  private toPublicShop(response: GetManyShopsResponse['shops'][number]) {
    return {
      id: response.id,
      name: response.name,
      userId: response.userId,
      description: response.description,
      logo: response.logo,
      banner: response.banner,
      phone: response.phone,
      pickupAddress: response.pickupAddress,
      pickupProvinceId: response.pickupProvinceId,
      pickupDistrictId: response.pickupDistrictId,
      pickupWardId: response.pickupWardId,
      pickupLatitude: response.pickupLatitude,
      pickupLongitude: response.pickupLongitude,
      createdAt: response.createdAt,
    };
  }
}
