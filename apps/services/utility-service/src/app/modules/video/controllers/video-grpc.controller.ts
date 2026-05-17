import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateVideoRequest,
  DeleteVideoRequest,
  GetManyVideosRequest,
  GetVideoRequest,
  UpdateVideoRequest,
  UpdateVideoStatusRequest,
} from '@common/interfaces/models/utility';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VideoService } from '../services/video.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class VideoGrpcController {
  constructor(private readonly videoService: VideoService) {}

  @GrpcMethod(GrpcModuleName.UTILITY.VIDEO, 'CreateVideo')
  createVideo(data: CreateVideoRequest) {
    return this.videoService.create(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.VIDEO, 'GetManyVideos')
  getManyVideos(data: GetManyVideosRequest) {
    return this.videoService.list(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.VIDEO, 'GetVideo')
  getVideo(data: GetVideoRequest) {
    return this.videoService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.VIDEO, 'UpdateVideo')
  updateVideo(data: UpdateVideoRequest) {
    return this.videoService.update(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.VIDEO, 'UpdateVideoStatus')
  updateVideoStatus(data: UpdateVideoStatusRequest) {
    return this.videoService.updateStatus(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.VIDEO, 'DeleteVideo')
  deleteVideo(data: DeleteVideoRequest) {
    return this.videoService.delete(data);
  }
}
