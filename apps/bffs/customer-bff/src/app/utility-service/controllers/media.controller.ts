import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreatePresignedUrlRequestDto,
  CreatePresignedUrlResponseDto,
} from '@common/interfaces/dtos/utility';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MediaService } from '../services/media.service';

@Controller('utility/media')
@ApiTags('Utility/Media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presigned-url')
  @ApiOkResponse({
    type: CreatePresignedUrlResponseDto,
  })
  async createPresignedUrl(
    @Body() body: CreatePresignedUrlRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.mediaService.createPresignedUrl({
      processId,
      userId,
      fileName: body.fileName,
      type: body.type,
    });
  }
}
