import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreatePresignedUrlRequest,
  CreatePresignedUrlResponse,
} from '@common/interfaces/models/utility';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MediaService } from '../services/image.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class MediaGrpcController {
  constructor(private readonly mediaService: MediaService) {}

  @GrpcMethod(GrpcModuleName.UTILITY.MEDIA, 'CreatePresignedUrl')
  async createPresignedUrl(
    data: CreatePresignedUrlRequest,
  ): Promise<CreatePresignedUrlResponse> {
    return this.mediaService.createPresignedUrl(data);
  }
}
