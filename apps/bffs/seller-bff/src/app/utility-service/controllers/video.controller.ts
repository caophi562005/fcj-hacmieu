import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateVideoRequestDto,
  DeleteVideoRequestDto,
  GetManyVideosRequestDto,
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
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { VideoService } from '../services/video.service';

@Controller('utility/video')
@ApiTags('Utility/Video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @ApiOkResponse({ type: VideoResponseDto })
  async createVideo(
    @Body() body: CreateVideoRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.videoService.createVideo({
      processId,
      shopId,
      uploadedById: userId,
      productId: body.productId,
    });
  }

  @Get()
  @ApiOkResponse({ type: GetManyVideosResponseDto })
  async getManyVideos(
    @Query() queries: GetManyVideosRequestDto,
    @UserData('shopId') shopId: string,
  ) {
    return this.videoService.getManyVideos({
      ...queries,
      shopId,
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
