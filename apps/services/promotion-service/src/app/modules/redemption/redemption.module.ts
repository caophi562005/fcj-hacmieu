import { Global, Module } from '@nestjs/common';
import { RedemptionGrpcController } from './controllers/redemption-grpc.controller';
import { RedemptionRepository } from './repositories/redemption.repository';
import { RedemptionService } from './services/redemption.service';

@Global()
@Module({
  controllers: [RedemptionGrpcController],
  providers: [RedemptionRepository, RedemptionService],
  exports: [RedemptionService],
})
export class RedemptionModule {}
