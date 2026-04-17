import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateNotificationRequestDto,
  GetManyNotificationsRequestDto,
  GetManyNotificationsResponseDto,
  GetNotificationRequestDto,
  GetNotificationResponseDto,
  ReadNotificationRequestDto,
  ReadNotificationResponseDto,
} from '@common/interfaces/dtos/utility';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';

@Controller('utility/notification')
@ApiTags('Utility/Notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyNotificationsResponseDto,
  })
  async getManyNotifications(
    @Query() queries: GetManyNotificationsRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.notificationService.getManyNotifications({
      ...queries,
      processId,
      userId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: GetNotificationResponseDto,
  })
  async getNotification(
    @Param() params: GetNotificationRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.notificationService.getNotification({
      ...params,
      processId,
      userId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: GetNotificationResponseDto,
  })
  async createNotification(
    @Body() body: CreateNotificationRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.notificationService.createNotification({
      ...body,
      processId,
      createdById: userId,
      metadata: body.metadata ? JSON.stringify(body.metadata) : undefined,
    });
  }

  @Put('read')
  @ApiOkResponse({
    type: ReadNotificationResponseDto,
  })
  async readNotification(
    @Body() body: ReadNotificationRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.notificationService.readNotification({
      ...body,
      processId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: GetNotificationResponseDto,
  })
  async deleteNotification(
    @Param('id') id: string,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.notificationService.deleteNotification({
      id,
      processId,
      deletedById: userId,
    });
  }
}
