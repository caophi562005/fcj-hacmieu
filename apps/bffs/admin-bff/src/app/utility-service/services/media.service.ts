import {
  CreatePresignedUrlRequest,
  CreatePresignedUrlResponse,
  MEDIA_SERVICE_NAME,
  MediaServiceClient,
  UTILITY_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/utility';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MediaService implements OnModuleInit {
  private mediaModule!: MediaServiceClient;

  constructor(
    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private utilityClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.mediaModule =
      this.utilityClient.getService<MediaServiceClient>(MEDIA_SERVICE_NAME);
  }

  async createPresignedUrl(
    data: CreatePresignedUrlRequest,
  ): Promise<CreatePresignedUrlResponse> {
    return firstValueFrom(this.mediaModule.createPresignedUrl(data));
  }
}
