import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  AdjustWalletRequest,
  GetMyTransactionsRequest,
  GetMyWalletRequest,
} from '@common/interfaces/models/wallet';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WalletService } from '../services/wallet.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class WalletGrpcController {
  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod(GrpcModuleName.WALLET.WALLET, 'GetMyWallet')
  getMyWallet(data: GetMyWalletRequest) {
    return this.walletService.getMyWallet(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.WALLET, 'AdjustWallet')
  adjustWallet(data: AdjustWalletRequest) {
    return this.walletService.adjustWallet(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.WALLET, 'GetMyTransactions')
  getMyTransactions(data: GetMyTransactionsRequest) {
    return this.walletService.getMyTransactions(data);
  }
}
