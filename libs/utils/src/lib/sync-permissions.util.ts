import { BaseConfiguration } from '@common/configurations/base.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { HttpMethodValues } from '@common/constants/http-method.constant';
import { GroupType } from '@common/constants/user.constant';
import {
  CountResponse,
  PERMISSION_MODULE_SERVICE_NAME,
  PermissionModuleClient,
} from '@common/interfaces/proto-types/iam';
import { INestApplication, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const executeSyncWithRetry = async (
  app: INestApplication,
  group: GroupType,
  maxRetries = 5,
  initialDelayMs = 1000,
): Promise<void> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      Logger.log(
        `[SyncPermissions] Attempt ${attempt + 1}/${
          maxRetries + 1
        } to sync permissions for group: ${group}`,
      );

      const grpcClient = app.get<ClientGrpc>(GrpcService.IAM_SERVICE);
      const permissionModule = grpcClient.getService<PermissionModuleClient>(
        PERMISSION_MODULE_SERVICE_NAME,
      );

      const server = app.getHttpAdapter().getInstance();
      const router = server.router;
      const globalPrefix = BaseConfiguration.GLOBAL_PREFIX || 'api/v1';

      const permissionInDb = await firstValueFrom(
        permissionModule.getAllPermissions({
          group,
        }),
      );

      const permissionItems = Array.isArray(permissionInDb?.permissions)
        ? permissionInDb.permissions
        : [];

      if (!Array.isArray(permissionInDb?.permissions)) {
        Logger.warn(
          `[SyncPermissions] getAllPermissions returned no permissions array for group: ${group}`,
        );
      }

      let availableRoutes: {
        path: string;
        method: keyof typeof HttpMethodValues;
        module: string;
        name: string;
        group: GroupType;
      }[] = router.stack
        .map((layer: any) => {
          if (layer.route) {
            const path = layer.route?.path;
            const method = String(
              layer.route?.stack[0].method,
            ).toUpperCase() as keyof typeof HttpMethodValues;

            // Skip wildcard routes or routes without valid HTTP methods
            if (path.includes('*') || !HttpMethodValues[method]) {
              return undefined;
            }

            // Remove global prefix to get actual module name
            // e.g., /api/v1/auth/login -> auth
            const pathWithoutPrefix = path.replace(`/${globalPrefix}/`, '');
            const moduleName = String(
              pathWithoutPrefix.split('/')[0],
            ).toUpperCase();
            return {
              path,
              method,
              name: method + ' ' + path,
              module: moduleName,
              group,
            };
          }
          return undefined;
        })
        .filter((item: any) => item !== undefined);

      availableRoutes = availableRoutes.filter((route) => {
        // Loại bỏ các route không cần thiết
        const unnecessaryModules = ['DOCS', 'DOCS-JSON', `DOCS-YAML`];
        if (unnecessaryModules.includes(route.module)) {
          return false;
        }
        return true;
      });

      //Tạo object PermissionInDbMap với key là [method-path]
      const permissionInDbMap = permissionItems.reduce(
        (acc, item) => {
          acc[`${item.method}-${item.path}`] = item;
          return acc;
        },
        {} as Record<string, any>,
      );
      // Logger.debug('Permission in DB Map: ', permissionInDbMap);

      //Tạo object availableRoutesMap với key là [method-path]
      const availableRoutesMap = availableRoutes.reduce(
        (acc, item) => {
          acc[`${item.method}-${item.path}`] = item;
          return acc;
        },
        {} as Record<string, any>,
      );
      // Logger.debug('Available Routes Map: ', availableRoutesMap);

      //Tìm permission trong db mà k tồn tại trong available
      const permissionToDelete = permissionItems.filter((item) => {
        return !availableRoutesMap[`${item.method}-${item.path}`];
      });
      // Logger.debug('Permission to delete: ', permissionToDelete);

      //Xoá permission không tồn tại trong availableRoutes
      let deleteResult: CountResponse = { count: 0 };
      if (permissionToDelete.length > 0) {
        deleteResult = await firstValueFrom(
          permissionModule.deleteManyPermissions({
            ids: permissionToDelete.map((item) => item.id),
          }),
        );
        Logger.log(`Delete : ${deleteResult.count}`);
      } else {
        Logger.log('No permission to delete');
      }

      //Tìm route không tồn tại trong permissionInDb
      const routesToAdd = availableRoutes.filter((item) => {
        return !permissionInDbMap[`${item.method}-${item.path}`];
      });

      //Thêm các route
      let permissionToAdd: CountResponse = { count: 0 };
      if (routesToAdd.length > 0) {
        permissionToAdd = await firstValueFrom(
          permissionModule.createManyPermissions({
            permissions: routesToAdd,
          }),
        );
        Logger.log(`Add : ${permissionToAdd.count}`);
      } else {
        Logger.log('No permission to add');
      }

      Logger.log(
        `[SyncPermissions] ✓ Successfully synced permissions for group: ${group}`,
      );
      return; // Success - exit function
    } catch (error) {
      lastError = error as Error;
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        Logger.error(
          `[SyncPermissions] ✗ Failed to sync permissions after ${
            maxRetries + 1
          } attempts for group: ${group}`,
          error instanceof Error ? error.stack : String(error),
        );
      } else {
        // Calculate exponential backoff delay: 1s, 2s, 4s, 8s, 16s...
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        Logger.warn(
          `[SyncPermissions] ⚠ Attempt ${
            attempt + 1
          } failed. Retrying in ${delayMs}ms...`,
          error instanceof Error ? error.message : String(error),
        );
        await sleep(delayMs);
      }
    }
  }

  // Báo lỗi khi đã hết số lần thử
  throw new Error(
    `Failed to sync permissions for group ${group} after ${
      maxRetries + 1
    } attempts. Last error: ${lastError?.message}`,
  );
};

export const syncPermissions = async (
  app: INestApplication,
  group: GroupType,
) => {
  try {
    await executeSyncWithRetry(app, group);
  } catch (error) {
    Logger.error(
      `[SyncPermissions] Permission sync failed but application will continue running`,
      error instanceof Error ? error.stack : String(error),
    );
  }
};
