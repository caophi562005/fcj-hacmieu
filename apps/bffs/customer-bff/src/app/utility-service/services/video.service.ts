import {
  GetManyVideosResponse,
  GetVideoFeedRequest,
  GetVideoRequest,
  VideoResponse,
} from '@common/interfaces/models/utility';
import {
  UTILITY_SERVICE_PACKAGE_NAME,
  VIDEO_SERVICE_NAME,
} from '@common/interfaces/proto-types/utility';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface VideoServiceClient {
  getVideo(data: GetVideoRequest): Observable<VideoResponse>;
  getVideoFeed(data: GetVideoFeedRequest): Observable<GetManyVideosResponse>;
}

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

  async getVideo(data: GetVideoRequest): Promise<VideoResponse> {
    return firstValueFrom(this.videoClient.getVideo(data));
  }

  async getVideoFeed(
    data: GetVideoFeedRequest,
  ): Promise<GetManyVideosResponse> {
    return firstValueFrom(this.videoClient.getVideoFeed(data));
  }
}
