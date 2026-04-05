import { BaseConfiguration } from '@common/configurations/base.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { HttpMethodValues } from '@common/constants/http-method.constant';
import { DefaultRoleName } from '@common/constants/user.constant';
import {
  CountResponse,
  ROLE_SERVICE_NAME,
  RoleServiceClient,
} from '@common/interfaces/proto-types/role';
import { INestApplication, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const executeSyncWithRetry = async (
  app: INestApplication,
  roleName: DefaultRoleName,
  maxRetries = 5,
  initialDelayMs = 1000
): Promise<void> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      Logger.log(
        `[SyncPermissions] Attempt ${attempt + 1}/${
          maxRetries + 1
        } to sync permissions for role: ${roleName}`
      );

      const grpcClient = app.get<ClientGrpc>(GrpcService.ROLE_SERVICE);
      const roleService =
        grpcClient.getService<RoleServiceClient>(ROLE_SERVICE_NAME);

      const role = await firstValueFrom(
        roleService.getRole({
          name: roleName,
          withInheritance: false,
        })
      );

      const server = app.getHttpAdapter().getInstance();
      const router = server.router;
      const globalPrefix = BaseConfiguration.GLOBAL_PREFIX || 'api/v1';

      const permissionInDb = role.permissions || [];

      let availableRoutes: {
        path: string;
        method: keyof typeof HttpMethodValues;
        module: string;
        name: string;
      }[] = router.stack
        .map((layer: any) => {
          if (layer.route) {
            const path = layer.route?.path;
            const method = String(
              layer.route?.stack[0].method
            ).toUpperCase() as keyof typeof HttpMethodValues;

            // Skip wildcard routes or routes without valid HTTP methods
            if (path.includes('*') || !HttpMethodValues[method]) {
              return undefined;
            }

            // Remove global prefix to get actual module name
            // e.g., /api/v1/auth/login -> auth
            const pathWithoutPrefix = path.replace(`/${globalPrefix}/`, '');
            const moduleName = String(
              pathWithoutPrefix.split('/')[0]
            ).toUpperCase();
            return {
              path,
              method,
              name: method + ' ' + path,
              module: moduleName,
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
      const permissionInDbMap = permissionInDb.reduce((acc, item) => {
        acc[`${item.method}-${item.path}`] = item;
        return acc;
      }, {} as Record<string, any>);
      // Logger.debug('Permission in DB Map: ', permissionInDbMap);

      //Tạo object availableRoutesMap với key là [method-path]
      const availableRoutesMap = availableRoutes.reduce((acc, item) => {
        acc[`${item.method}-${item.path}`] = item;
        return acc;
      }, {} as Record<string, any>);
      // Logger.debug('Available Routes Map: ', availableRoutesMap);

      //Tìm permission trong db mà k tồn tại trong available
      const permissionToDelete = permissionInDb.filter((item) => {
        return !availableRoutesMap[`${item.method}-${item.path}`];
      });
      // Logger.debug('Permission to delete: ', permissionToDelete);

      //Xoá permission không tồn tại trong availableRoutes
      let deleteResult: CountResponse = { count: 0 };
      if (permissionToDelete.length > 0) {
        deleteResult = await firstValueFrom(
          roleService.deleteManyPermissions({
            ids: permissionToDelete.map((item) => item.id),
          })
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
          roleService.createManyPermissions({
            permissions: routesToAdd,
          })
        );
        Logger.log(`Add : ${permissionToAdd.count}`);
      } else {
        Logger.log('No permission to add');
      }

      if (permissionToAdd.count > 0 || deleteResult.count > 0) {
        const updatedPermissionInDb = await firstValueFrom(
          roleService.getManyUniquePermissions({
            names: availableRoutes.map((item) => item.name),
          })
        );

        await firstValueFrom(
          roleService.updateRole({
            id: role.id,
            updatedById: 'SYSTEM',
            permissionIds: updatedPermissionInDb.permissions.map(
              (item) => item.id
            ),
          })
        );
      }

      Logger.log(
        `[SyncPermissions] ✓ Successfully synced permissions for role: ${roleName}`
      );
      return; // Success - exit function
    } catch (error) {
      lastError = error as Error;
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        Logger.error(
          `[SyncPermissions] ✗ Failed to sync permissions after ${
            maxRetries + 1
          } attempts for role: ${roleName}`,
          error instanceof Error ? error.stack : String(error)
        );
      } else {
        // Calculate exponential backoff delay: 1s, 2s, 4s, 8s, 16s...
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        Logger.warn(
          `[SyncPermissions] ⚠ Attempt ${
            attempt + 1
          } failed. Retrying in ${delayMs}ms...`,
          error instanceof Error ? error.message : String(error)
        );
        await sleep(delayMs);
      }
    }
  }

  // Báo lỗi khi đã hết số lần thử
  throw new Error(
    `Failed to sync permissions for role ${roleName} after ${
      maxRetries + 1
    } attempts. Last error: ${lastError?.message}`
  );
};

export const syncPermissions = async (
  app: INestApplication,
  roleName: DefaultRoleName
) => {
  try {
    await executeSyncWithRetry(app, roleName);
  } catch (error) {
    Logger.error(
      `[SyncPermissions] Permission sync failed but application will continue running`,
      error instanceof Error ? error.stack : String(error)
    );
  }
};
