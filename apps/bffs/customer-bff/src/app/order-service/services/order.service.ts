import {
  AddCartItemRequest,
  CancelOrderRequest,
  CART_MODULE_SERVICE_NAME,
  CartModuleClient,
  CartResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  DeleteCartItemRequest,
  GetManyCartItemsRequest,
  GetManyCartItemsResponse,
  GetManyOrdersRequest,
  GetManyOrdersResponse,
  GetOrderRequest,
  GetOrderResponse,
  ORDER_MODULE_SERVICE_NAME,
  ORDER_SERVICE_PACKAGE_NAME,
  OrderModuleClient,
  UpdateCartItemRequest,
  UpdateStatusOrderRequest,
  ValidateCartItemsRequest,
  ValidateCartItemsResponse,
} from '@common/interfaces/proto-types/order';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService implements OnModuleInit {
  private orderModule!: OrderModuleClient;
  private cartModule!: CartModuleClient;

  constructor(
    @Inject(ORDER_SERVICE_PACKAGE_NAME)
    private readonly orderClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderModule = this.orderClient.getService<OrderModuleClient>(
      ORDER_MODULE_SERVICE_NAME,
    );
    this.cartModule = this.orderClient.getService<CartModuleClient>(
      CART_MODULE_SERVICE_NAME,
    );
  }

  // async sendOrderMessage(payload: Record<string, unknown>) {
  //   try {
  //     await this.sqsService.send('CREATE_PAYMENT', {
  //       id: uuidv4(), // ID duy nhất cho message
  //       body: payload, // Dữ liệu bạn muốn gửi (sẽ tự động stringify JSON)
  //       delaySeconds: 0,
  //     });
  //     return {
  //       message: 'Message sent successfully',
  //     };
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //     throw new InternalServerErrorException('Error.SendOrderMessageFailed');
  //   }
  // }

  async getManyOrders(
    data: GetManyOrdersRequest,
  ): Promise<GetManyOrdersResponse> {
    return firstValueFrom(this.orderModule.getManyOrders(data));
  }

  async getOrder(data: GetOrderRequest): Promise<GetOrderResponse> {
    return firstValueFrom(this.orderModule.getOrder(data));
  }

  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return firstValueFrom(this.orderModule.createOrder(data));
  }

  async updateStatusOrder(data: UpdateStatusOrderRequest) {
    return firstValueFrom(this.orderModule.updateStatusOrder(data));
  }

  async cancelOrder(data: CancelOrderRequest) {
    return firstValueFrom(this.orderModule.cancelOrder(data));
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

  async validateCartItems(
    data: ValidateCartItemsRequest,
  ): Promise<ValidateCartItemsResponse> {
    return firstValueFrom(this.cartModule.validateCartItems(data));
  }
}
