import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { VideoRepository } from '../repositories/video.repository';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

type UpdateVideoStatusMessage = {
  videoId: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  duration?: number;
  width?: number;
  height?: number;
};

@Injectable()
export class VideoStatusConsumerService {
  private readonly logger = new Logger(VideoStatusConsumerService.name);

  constructor(private readonly videoRepository: VideoRepository) {}

  @SqsMessageHandler(SqsConfiguration.UPDATE_VIDEO_STATUS_QUEUE_NAME, false)
  async handleUpdateVideoStatusMessage(message: SqsMessage) {
    if (!message.Body) {
      this.logger.warn(
        `Skip empty message: ${message.MessageId ?? 'unknown-id'}`,
      );
      return;
    }

    const body: UpdateVideoStatusMessage = JSON.parse(message.Body);

    await this.videoRepository.updateStatus({
      id: body.videoId,
      status: body.status,
      duration: body.duration,
      width: body.width,
      height: body.height,
    });

    this.logger.log(
      `Video ${body.videoId} → ${body.status} (${body.duration}s, ${body.width}x${body.height})`,
    );
  }
}
