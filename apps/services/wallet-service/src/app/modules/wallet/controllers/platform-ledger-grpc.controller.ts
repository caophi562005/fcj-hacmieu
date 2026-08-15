import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  GetPlatformLedgerListRequest,
  GetPlatformRevenueSummaryRequest,
  RecordPlatformLedgerRequest,
} from '@common/interfaces/proto-types/wallet';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PlatformLedgerService } from '../services/platform-ledger.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class PlatformLedgerGrpcController {
  constructor(
    private readonly platformLedgerService: PlatformLedgerService,
  ) {}

  @GrpcMethod(
    GrpcModuleName.WALLET.PLATFORM_LEDGER,
    'RecordPlatformLedger',
  )
  recordPlatformLedger(data: RecordPlatformLedgerRequest) {
    return this.platformLedgerService.recordPlatformLedger(data);
  }

  @GrpcMethod(
    GrpcModuleName.WALLET.PLATFORM_LEDGER,
    'GetPlatformRevenueSummary',
  )
  getPlatformRevenueSummary(data: GetPlatformRevenueSummaryRequest) {
    return this.platformLedgerService.getPlatformRevenueSummary(data);
  }

  @GrpcMethod(
    GrpcModuleName.WALLET.PLATFORM_LEDGER,
    'GetPlatformLedgerList',
  )
  getPlatformLedgerList(data: GetPlatformLedgerListRequest) {
    return this.platformLedgerService.getPlatformLedgerList(data);
  }
}
