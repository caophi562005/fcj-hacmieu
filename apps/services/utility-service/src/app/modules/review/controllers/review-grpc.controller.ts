import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateReviewRequest,
  DeleteReviewRequest,
  GetManyReviewsRequest,
  GetReviewRequest,
  UpdateReviewRequest,
} from '@common/interfaces/models/utility';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReviewService } from '../services/review.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class ReviewGrpcController {
  constructor(private readonly reviewService: ReviewService) {}

  @GrpcMethod(GrpcModuleName.UTILITY.REVIEW, 'GetManyReviews')
  getManyReviews(data: GetManyReviewsRequest) {
    return this.reviewService.list(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REVIEW, 'GetReview')
  getReview(data: GetReviewRequest) {
    return this.reviewService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REVIEW, 'CreateReview')
  createReview(data: CreateReviewRequest) {
    return this.reviewService.create(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REVIEW, 'UpdateReview')
  updateReview(data: UpdateReviewRequest) {
    return this.reviewService.update(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REVIEW, 'DeleteReview')
  deleteReview(data: DeleteReviewRequest) {
    return this.reviewService.delete(data);
  }
}
