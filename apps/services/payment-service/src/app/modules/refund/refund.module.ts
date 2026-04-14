import { Module } from '@nestjs/common';
import { RefundGrpcController } from './controllers/refund-grpc.controller';
import { RefundRepository } from './repositories/refund.repository';
import { RefundService } from './services/refund.service';

@Module({
  controllers: [RefundGrpcController],
  providers: [RefundRepository, RefundService],
})
export class RefundModule {}
