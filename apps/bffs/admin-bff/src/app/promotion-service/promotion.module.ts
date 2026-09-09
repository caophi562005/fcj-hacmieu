import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { PromotionController } from './controllers/promotion.controller';
import { MarketingController } from './controllers/marketing.controller';
import { MarketingService } from './services/marketing.service';
import { PromotionService } from './services/promotion.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.PROMOTION_SERVICE)]),
  ],
  controllers: [PromotionController, MarketingController],
  providers: [PromotionService, MarketingService],
})
export class PromotionModule {}
