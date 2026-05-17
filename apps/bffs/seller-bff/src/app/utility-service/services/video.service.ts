import {
  CreateVideoRequest,
  DeleteVideoRequest,
  GetManyVideosRequest,
  GetManyVideosResponse,
  GetVideoRequest,
  UpdateVideoRequest,
  UTILITY_SERVICE_PACKAGE_NAME,
  VIDEO_SERVICE_NAME,
  VideoResponse,
  VideoServiceClient,
} from '@common/interfaces/proto-types/utility';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VideoService implements OnModuleInit {
  private videoClient!: VideoServiceClient;

  constructor(
    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private utilityClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.videoClient =
      this.utilityClient.getService<VideoServiceClient>(VIDEO_SERVICE_NAME);
  }

  async createVideo(data: CreateVideoRequest): Promise<VideoResponse> {
    return firstValueFrom(this.videoClient.createVideo(data));
  }

  async getManyVideos(
    data: GetManyVideosRequest,
  ): Promise<GetManyVideosResponse> {
    return firstValueFrom(this.videoClient.getManyVideos(data));
  }

  async getVideo(data: GetVideoRequest): Promise<VideoResponse> {
    return firstValueFrom(this.videoClient.getVideo(data));
  }

  async updateVideo(data: UpdateVideoRequest): Promise<VideoResponse> {
    return firstValueFrom(this.videoClient.updateVideo(data));
  }

  async deleteVideo(data: DeleteVideoRequest): Promise<VideoResponse> {
    return firstValueFrom(this.videoClient.deleteVideo(data));
  }
}
