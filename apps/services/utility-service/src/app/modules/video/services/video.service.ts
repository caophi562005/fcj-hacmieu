import { S3Configuration } from '@common/configurations/s3.config';
import {
  CreateVideoRequest,
  DeleteVideoRequest,
  GetManyVideosRequest,
  GetVideoFeedRequest,
  GetVideoRequest,
  UpdateVideoRequest,
  UpdateVideoStatusRequest,
} from '@common/interfaces/models/utility';
import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from '../../media/services/s3.service';
import { VideoRepository } from '../repositories/video.repository';

@Injectable()
export class VideoService {
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly s3Service: S3Service,
  ) {}

  async create(data: CreateVideoRequest) {
    const video = await this.videoRepository.create({
      shopId: data.shopId,
      uploadedById: data.uploadedById,
      ...(data.productId && { productId: data.productId }),
    });

    // Presigned URL cho client upload: shops/{shopId}/videos/{videoId}.mp4
    const key = `shops/${data.shopId}/videos/${video.id}.mp4`;
    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(key);

    return {
      ...this.toResponse(video),
      presignedUrl,
      hlsUrl: '',
      thumbnailUrl: '',
    };
  }

  async list(data: GetManyVideosRequest) {
    const result = await this.videoRepository.list(data);

    return {
      ...result,
      videos: result.videos.map((v) => this.toResponse(v)),
    };
  }

  async findById(data: GetVideoRequest) {
    const video = await this.videoRepository.findById(data.id);
    if (!video) throw new NotFoundException('Video not found');
    return this.toResponse(video);
  }

  async updateStatus(data: UpdateVideoStatusRequest) {
    const video = await this.videoRepository.updateStatus({
      id: data.id,
      status: data.status,
      duration: data.duration,
      width: data.width,
      height: data.height,
    });
    return this.toResponse(video);
  }

  async update(data: UpdateVideoRequest) {
    const video = await this.videoRepository.update({
      id: data.id,
      productId: data.productId,
      isHidden: data.isHidden,
    });
    return this.toResponse(video);
  }

  async feed(data: GetVideoFeedRequest) {
    const videos = await this.videoRepository.feed({
      limit: data.limit,
      excludeIds: data.excludeIds,
    });

    return {
      page: 1,
      limit: data.limit,
      totalItems: videos.length,
      totalPages: 1,
      videos: videos.map((v: any) => this.toResponse(v)),
    };
  }

  async delete(data: DeleteVideoRequest) {
    const video = await this.videoRepository.delete(data.id);
    return this.toResponse(video);
  }

  private toResponse(video: any) {
    const endpoint = S3Configuration.S3_ENDPOINT;
    const hlsUrl =
      video.status === 'READY'
        ? `${endpoint}/shops/${video.shopId}/videos_hls/${video.id}/${video.id}.m3u8`
        : '';
    const thumbnailUrl =
      video.status === 'READY'
        ? `${endpoint}/shops/${video.shopId}/videos_hls/${video.id}/${video.id}thumb.0000000.jpg`
        : '';

    return {
      id: video.id,
      shopId: video.shopId,
      productId: video.productId ?? null,
      status: video.status,
      isHidden: video.isHidden,
      duration: video.duration ?? null,
      width: video.width ?? null,
      height: video.height ?? null,
      likeCount: video.likeCount,
      uploadedById: video.uploadedById,
      deletedAt: video.deletedAt?.toISOString() ?? null,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      presignedUrl: '',
      hlsUrl,
      thumbnailUrl,
    };
  }
}
