import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import type {
  CreateShopPayoutRequest,
  DeleteShopPayoutRequest,
  GetShopPayoutByIdRequest,
  GetShopPayoutsRequest,
  UpdateShopPayoutStatusRequest,
} from '@common/interfaces/models/wallet';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PayoutService } from '../services/payout.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class PayoutGrpcController {
  constructor(private readonly payoutService: PayoutService) {}

  @GrpcMethod(GrpcModuleName.WALLET.PAYOUT, 'CreateShopPayout')
  createShopPayout(data: CreateShopPayoutRequest) {
    return this.payoutService.createShopPayout(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.PAYOUT, 'GetShopPayoutById')
  getShopPayoutById(data: GetShopPayoutByIdRequest) {
    return this.payoutService.getShopPayoutById(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.PAYOUT, 'GetShopPayouts')
  getShopPayouts(data: GetShopPayoutsRequest) {
    return this.payoutService.getShopPayouts(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.PAYOUT, 'UpdateShopPayoutStatus')
  updateShopPayoutStatus(data: UpdateShopPayoutStatusRequest) {
    return this.payoutService.updateShopPayoutStatus(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.PAYOUT, 'DeleteShopPayout')
  deleteShopPayout(data: DeleteShopPayoutRequest) {
    return this.payoutService.deleteShopPayout(data);
  }
}
