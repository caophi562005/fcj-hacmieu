import { IsPublic } from '@common/decorators/auth.decorator';
import { GetVideoFeedRequestSchema } from '@common/interfaces/models/utility';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VideoService } from '../services/video.service';

@Controller('utility/video')
@ApiTags('Utility/Video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @IsPublic()
  @Post('feed')
  async getVideoFeed(@Body() body: unknown) {
    const result = GetVideoFeedRequestSchema.omit({
      processId: true,
    }).safeParse(body);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => issue.message),
      );
    }

    return this.videoService.getVideoFeed({
      limit: result.data.limit,
      excludeIds: result.data.excludeIds,
    });
  }

  @IsPublic()
  @Get(':id')
  async getVideo(@Param('id') id: string) {
    return this.videoService.getVideo({ id });
  }
}
