import { Global, Module } from '@nestjs/common';
import { RedemptionConsumerController } from './controllers/redemption-consumer.controller';
import { RedemptionRepository } from './repositories/redemption.repository';
import { RedemptionService } from './services/redemption.service';

@Global()
@Module({
  controllers: [RedemptionConsumerController],
  providers: [RedemptionRepository, RedemptionService],
  exports: [RedemptionService],
})
export class RedemptionModule {}
