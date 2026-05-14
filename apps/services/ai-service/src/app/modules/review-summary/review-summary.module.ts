import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ReviewSummaryGrpcController } from './controllers/review-summary-grpc.controller';
import { ReviewSummaryRepository } from './repositories/review-summary.repository';
import { ReviewSummaryService } from './services/review-summary.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.UTILITY_SERVICE)]),
  ],
  controllers: [ReviewSummaryGrpcController],
  providers: [ReviewSummaryRepository, ReviewSummaryService],
  exports: [ReviewSummaryService],
})
export class ReviewSummaryModule {}
