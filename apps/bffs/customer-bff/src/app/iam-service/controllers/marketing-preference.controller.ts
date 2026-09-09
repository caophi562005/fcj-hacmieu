import { MarketingConfiguration } from '@common/configurations/marketing.config';
import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  MarketingPreferencesResponseDto,
  UpdateMarketingPreferencesRequestDto,
} from '@common/interfaces/dtos/iam';
import { verifyMarketingUnsubscribeToken } from '@common/utils/marketing-token.util';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MarketingPreferenceService } from '../services/marketing-preference.service';

@Controller('iam/marketing-preferences')
@ApiTags('Iam/Marketing Preferences')
export class MarketingPreferenceController {
  constructor(private readonly service: MarketingPreferenceService) {}

  @Get()
  @ApiOkResponse({ type: MarketingPreferencesResponseDto })
  get(@UserData('userId') userId: string, @ProcessId() processId: string) {
    return this.service.get({ userId, processId });
  }

  @Put()
  @ApiOkResponse({ type: MarketingPreferencesResponseDto })
  update(
    @Body() body: UpdateMarketingPreferencesRequestDto,
    @UserData('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.service.update({ ...body, userId, processId });
  }

  @Get('unsubscribe')
  @IsPublic()
  @Header('Content-Type', 'text/html; charset=utf-8')
  async unsubscribePage(
    @Query('token') token: string,
    @ProcessId() processId: string,
  ) {
    await this.unsubscribe(token, processId);
    return this.unsubscribeHtml();
  }

  @Post('unsubscribe')
  @IsPublic()
  @HttpCode(200)
  async unsubscribeOneClick(
    @Query('token') token: string,
    @ProcessId() processId: string,
  ) {
    await this.unsubscribe(token, processId);
    return '';
  }

  private async unsubscribe(token: string, processId: string) {
    const payload = verifyMarketingUnsubscribeToken(
      token || '',
      MarketingConfiguration.MARKETING_UNSUBSCRIBE_SECRET,
    );
    if (!payload)
      throw new BadRequestException('Liên kết từ chối không hợp lệ.');
    await this.service.unsubscribe({
      email: payload.email,
      topic: payload.topic,
      processId,
    });
  }

  private unsubscribeHtml() {
    return `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Đã ngừng nhận email</title><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:48px"><main style="max-width:560px;margin:auto;background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0"><h1>Đã cập nhật lựa chọn</h1><p>Bạn sẽ không còn nhận loại email tiếp thị này từ V-Shop.</p></main></body></html>`;
  }
}
