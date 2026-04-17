import { Module } from '@nestjs/common';
import { ReviewGrpcController } from './controllers/review-grpc.controller';
import { ReviewRepository } from './repositories/review.repository';
import { ReviewService } from './services/review.service';

@Module({
  controllers: [ReviewGrpcController],
  providers: [ReviewRepository, ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
