import { Module } from '@nestjs/common';
import { MarketingPreferenceGrpcController } from './controllers/marketing-preference-grpc.controller';
import { MarketingPreferenceRepository } from './repositories/marketing-preference.repository';
import { MarketingPreferenceService } from './services/marketing-preference.service';

@Module({
  controllers: [MarketingPreferenceGrpcController],
  providers: [MarketingPreferenceRepository, MarketingPreferenceService],
  exports: [MarketingPreferenceService],
})
export class MarketingPreferenceModule {}
