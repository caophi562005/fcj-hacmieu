import { IsPublic } from '@common/decorators/auth.decorator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VideoService } from '../services/video.service';

@Controller('utility/video')
@ApiTags('Utility/Video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @IsPublic()
  @Post('feed')
  async getVideoFeed(@Body() body: { limit?: number; excludeIds?: string[] }) {
    return this.videoService.getVideoFeed({
      limit: body.limit || 10,
      excludeIds: body.excludeIds || [],
    });
  }

  @IsPublic()
  @Get(':id')
  async getVideo(@Param('id') id: string) {
    return this.videoService.getVideo({ id });
  }
}
