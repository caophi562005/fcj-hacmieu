import {
  CancelOrderRequest,
  GetManyOrdersRequest,
  GetManyOrdersResponse,
  GetOrderRequest,
  GetOrderResponse,
  ORDER_MODULE_SERVICE_NAME,
  ORDER_SERVICE_PACKAGE_NAME,
  OrderModuleClient,
  UpdateStatusOrderRequest,
} from '@common/interfaces/proto-types/order';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService implements OnModuleInit {
  private orderModule!: OrderModuleClient;

  constructor(
    @Inject(ORDER_SERVICE_PACKAGE_NAME)
    private readonly orderClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderModule = this.orderClient.getService<OrderModuleClient>(
      ORDER_MODULE_SERVICE_NAME,
    );
  }

  async getManyOrders(
    data: GetManyOrdersRequest,
  ): Promise<GetManyOrdersResponse> {
    return firstValueFrom(this.orderModule.getManyOrders(data));
  }

  async getOrder(data: GetOrderRequest): Promise<GetOrderResponse> {
    return firstValueFrom(this.orderModule.getOrder(data));
  }

  async updateStatusOrder(data: UpdateStatusOrderRequest) {
    return firstValueFrom(this.orderModule.updateStatusOrder(data));
  }

  async cancelOrder(data: CancelOrderRequest) {
    return firstValueFrom(this.orderModule.cancelOrder(data));
  }
}
