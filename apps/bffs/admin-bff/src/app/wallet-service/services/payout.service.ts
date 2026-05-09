import {
  CreateShopPayoutRequest,
  DeleteShopPayoutRequest,
  GetShopPayoutByIdRequest,
  GetShopPayoutsRequest,
  GetShopPayoutsResponse,
  PAYOUT_MODULE_SERVICE_NAME,
  PayoutModuleClient,
  ShopPayoutResponse,
  UpdateShopPayoutStatusRequest,
  WALLET_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/wallet';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PayoutService implements OnModuleInit {
  private payoutModule!: PayoutModuleClient;

  constructor(
    @Inject(WALLET_SERVICE_PACKAGE_NAME)
    private readonly walletClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.payoutModule = this.walletClient.getService<PayoutModuleClient>(
      PAYOUT_MODULE_SERVICE_NAME,
    );
  }

  async createShopPayout(
    data: CreateShopPayoutRequest,
  ): Promise<ShopPayoutResponse> {
    return firstValueFrom(this.payoutModule.createShopPayout(data));
  }

  async getShopPayoutById(
    data: GetShopPayoutByIdRequest,
  ): Promise<ShopPayoutResponse> {
    return firstValueFrom(this.payoutModule.getShopPayoutById(data));
  }

  async getShopPayouts(
    data: GetShopPayoutsRequest,
  ): Promise<GetShopPayoutsResponse> {
    return firstValueFrom(this.payoutModule.getShopPayouts(data));
  }

  async updateShopPayoutStatus(
    data: UpdateShopPayoutStatusRequest,
  ): Promise<ShopPayoutResponse> {
    return firstValueFrom(this.payoutModule.updateShopPayoutStatus(data));
  }

  async deleteShopPayout(
    data: DeleteShopPayoutRequest,
  ): Promise<ShopPayoutResponse> {
    return firstValueFrom(this.payoutModule.deleteShopPayout(data));
  }
}
