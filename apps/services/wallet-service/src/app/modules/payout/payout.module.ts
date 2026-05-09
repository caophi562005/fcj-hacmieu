import { Global, Module } from '@nestjs/common';
import { PayoutGrpcController } from './controllers/payout-grpc.controller';
import { PayoutRepository } from './repositories/payout.repository';
import { PayoutService } from './services/payout.service';

@Global()
@Module({
  controllers: [PayoutGrpcController],
  providers: [PayoutRepository, PayoutService],
  exports: [PayoutService],
})
export class PayoutModule {}
