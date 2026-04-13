import { Global, Module } from '@nestjs/common';
import { RedemptionRepository } from './repositories/redemption.repository';
import { RedemptionService } from './services/redemption.service';

@Global()
@Module({
  providers: [RedemptionRepository, RedemptionService],
  exports: [RedemptionService],
})
export class RedemptionModule {}
