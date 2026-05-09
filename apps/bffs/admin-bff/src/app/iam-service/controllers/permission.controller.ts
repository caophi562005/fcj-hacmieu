import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CountResponse,
  CreateManyPermissionsRequest,
  CreatePermissionRequest,
  CreatePermissionResponse,
  GetAllPermissionsResponse,
  GetManyPermissionsResponse,
} from '@common/interfaces/proto-types/iam';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';

@Controller('iam/permission')
@ApiTags('Iam/Permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ApiOkResponse({
    type: Object,
  })
  async getManyPermissions(
    @Query('page') pageRaw: string,
    @Query('limit') limitRaw: string,
    @Query('group') group: string | undefined,
    @ProcessId() processId: string,
  ): Promise<GetManyPermissionsResponse> {
    const page = Math.max(1, Number(pageRaw) || 1);
    const limit = Math.max(1, Number(limitRaw) || 10);

    return this.permissionService.getManyPermissions({
      processId,
      page,
      limit,
      ...(group ? { group } : {}),
    });
  }

  @Get('all')
  @ApiOkResponse({
    type: Object,
  })
  async getAllPermissions(
    @Query('group') group: string,
    @ProcessId() processId: string,
  ): Promise<GetAllPermissionsResponse> {
    return this.permissionService.getAllPermissions({
      processId,
      group,
    });
  }

  @Post()
  @ApiOkResponse({
    type: Object,
  })
  async createPermission(
    @Body() body: Omit<CreatePermissionRequest, 'processId' | 'createdById'>,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ): Promise<CreatePermissionResponse> {
    return this.permissionService.createPermission({
      ...body,
      processId,
      createdById: userId,
    });
  }

  @Post('many')
  @ApiOkResponse({
    type: Object,
  })
  async createManyPermissions(
    @Body() body: CreateManyPermissionsRequest,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ): Promise<CountResponse> {
    return this.permissionService.createManyPermissions({
      permissions: body.permissions.map((item) => ({
        ...item,
        processId,
        createdById: userId,
      })),
    });
  }

  @Delete('many')
  @ApiOkResponse({
    type: Object,
  })
  async deleteManyPermissions(
    @Body() body: { ids: string[] },
  ): Promise<CountResponse> {
    return this.permissionService.deleteManyPermissions({ ids: body.ids });
  }
}
