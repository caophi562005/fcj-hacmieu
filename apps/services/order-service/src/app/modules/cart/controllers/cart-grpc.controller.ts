import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  AddCartItemRequest,
  DeleteCartItemRequest,
  GetManyCartItemsRequest,
  UpdateCartItemRequest,
  ValidateCartItemsRequest,
} from '@common/interfaces/models/order';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CartItemService } from '../services/cart-item.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class CartGrpcController {
  constructor(private readonly cartItemService: CartItemService) {}

  @GrpcMethod(GrpcModuleName.ORDER.CART, 'GetManyCartItems')
  getManyCartItems(data: GetManyCartItemsRequest) {
    return this.cartItemService.list(data);
  }

  @GrpcMethod(GrpcModuleName.ORDER.CART, 'AddCartItem')
  addCartItem(data: AddCartItemRequest) {
    return this.cartItemService.add(data);
  }

  @GrpcMethod(GrpcModuleName.ORDER.CART, 'UpdateCartItem')
  updateCartItem(data: UpdateCartItemRequest) {
    return this.cartItemService.update(data);
  }

  @GrpcMethod(GrpcModuleName.ORDER.CART, 'DeleteCartItem')
  deleteCartItem(data: DeleteCartItemRequest) {
    return this.cartItemService.delete(data);
  }

  @GrpcMethod(GrpcModuleName.ORDER.CART, 'ValidateCartItems')
  validateCartItems(data: ValidateCartItemsRequest) {
    return this.cartItemService.validateCartItems(data);
  }
}
