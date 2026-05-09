import {
  AddCartItemRequest,
  CART_MODULE_SERVICE_NAME,
  CartModuleClient,
  CartResponse,
  DeleteCartItemRequest,
  GetManyCartItemsRequest,
  GetManyCartItemsResponse,
  ORDER_SERVICE_PACKAGE_NAME,
  UpdateCartItemRequest,
} from '@common/interfaces/proto-types/order';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartService implements OnModuleInit {
  private cartModule!: CartModuleClient;

  constructor(
    @Inject(ORDER_SERVICE_PACKAGE_NAME)
    private readonly orderClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.cartModule = this.orderClient.getService<CartModuleClient>(
      CART_MODULE_SERVICE_NAME,
    );
  }

  async getManyCartItems(
    data: GetManyCartItemsRequest,
  ): Promise<GetManyCartItemsResponse> {
    return firstValueFrom(this.cartModule.getManyCartItems(data));
  }

  async addCartItem(data: AddCartItemRequest): Promise<CartResponse> {
    return firstValueFrom(this.cartModule.addCartItem(data));
  }

  async updateCartItem(data: UpdateCartItemRequest): Promise<CartResponse> {
    return firstValueFrom(this.cartModule.updateCartItem(data));
  }

  async deleteCartItem(data: DeleteCartItemRequest): Promise<CartResponse> {
    return firstValueFrom(this.cartModule.deleteCartItem(data));
  }
}
