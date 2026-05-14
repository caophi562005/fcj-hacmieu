import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ReviewSummaryController } from './controllers/review-summary.controller';
import { ReviewSummaryService } from './services/review-summary.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.AI_SERVICE)]),
  ],
  controllers: [ReviewSummaryController],
  providers: [ReviewSummaryService],
})
export class AiModule {}
