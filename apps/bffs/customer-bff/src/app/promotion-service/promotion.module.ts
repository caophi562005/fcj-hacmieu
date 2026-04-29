import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { PromotionController } from './controllers/promotion.controller';
import { RedemptionController } from './controllers/redemption.controller';
import { PromotionService } from './services/promotion.service';
import { RedemptionService } from './services/redemption.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.PROMOTION_SERVICE)]),
  ],
  controllers: [PromotionController, RedemptionController],
  providers: [PromotionService, RedemptionService],
})
export class PromotionModule {}
