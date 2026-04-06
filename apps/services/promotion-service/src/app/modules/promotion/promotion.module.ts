import { Global, Module } from '@nestjs/common';
import { PromotionGrpcController } from './controllers/promotion-grpc.controller';
import { PromotionRepository } from './repositories/promotion.repository';
import { PromotionService } from './services/promotion.service';

@Global()
@Module({
  controllers: [PromotionGrpcController],
  providers: [PromotionRepository, PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
