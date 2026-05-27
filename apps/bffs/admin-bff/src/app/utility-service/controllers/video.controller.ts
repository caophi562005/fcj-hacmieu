import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  DeleteVideoRequestDto,
  GetManyVideosResponseDto,
  GetVideoRequestDto,
  UpdateVideoRequestDto,
  VideoResponseDto,
} from '@common/interfaces/dtos/utility';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { VideoService } from '../services/video.service';

@Controller('utility/video')
@ApiTags('Utility/Video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  @ApiOkResponse({ type: GetManyVideosResponseDto })
  async getManyVideos(
    @Query() queries: any,
  ) {
    return this.videoService.getManyVideos({
      limit: queries.limit ? Number(queries.limit) : 10,
      page: queries.page ? Number(queries.page) : 1,
      shopId: queries.shopId,
      productId: queries.productId,
      status: queries.status,
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: VideoResponseDto })
  async getVideo(@Param() params: GetVideoRequestDto) {
    return this.videoService.getVideo(params);
  }

  @Patch(':id')
  @ApiOkResponse({ type: VideoResponseDto })
  async updateVideo(
    @Param('id') id: string,
    @Body() body: UpdateVideoRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.videoService.updateVideo({
      processId,
      id,
      productId: body.productId,
      isHidden: body.isHidden,
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: VideoResponseDto })
  async deleteVideo(
    @Param() params: DeleteVideoRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.videoService.deleteVideo({ ...params, processId });
  }
}
