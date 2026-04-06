import {
  CreateRoleRequest,
  DeleteRoleRequest,
  GetManyRolesRequest,
  GetManyRolesResponse,
  GetRoleResponse,
  UpdateRoleRequest,
} from '@common/interfaces/models/role/role';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/iam-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyRolesRequest): Promise<GetManyRolesResponse> {
    const skip = Number((data.page - 1) * data.limit);
    const take = Number(data.limit);

    const [totalItems, roles] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.role.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
        skip,
        take,
      }),
    ]);
    return {
      roles,
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  async find({
    data,
    withInheritance,
  }: {
    data: Prisma.RoleWhereInput;
    withInheritance: boolean;
  }): Promise<GetRoleResponse | null> {
    const where: Prisma.RoleWhereInput = {
      deletedAt: null,
    };
    if (data.id) {
      where.id = data.id;
    }
    if (data.name) {
      where.name = data.name;
    }
    const role = await this.prismaService.role.findFirst({
      where,
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            path: true,
            method: true,
          },
        },
        ...(withInheritance && {
          parents: {
            include: {
              parent: {
                select: {
                  permissions: {
                    where: { deletedAt: null },
                    select: { id: true, path: true, method: true },
                  },
                },
              },
            },
          },
        }),
      },
    });

    const directPermissions = role.permissions;
    const inheritedPermissions = withInheritance
      ? role.parents?.flatMap((p) => p.parent.permissions) || []
      : [];

    const merged = [...directPermissions, ...inheritedPermissions];

    const unique = Array.from(
      new Map(
        merged.map((item) => [`${item.method}-${item.path}`, item]),
      ).values(),
    );

    const { parents, ...rest } = role;

    return {
      ...rest,
      permissions: unique,
    };
  }

  create(data: CreateRoleRequest): Promise<GetRoleResponse> {
    return this.prismaService.role.create({
      data: {
        ...data,
        createdById: data.createdById,
      },
      include: {
        permissions: {
          select: {
            id: true,
            path: true,
            method: true,
          },
        },
      },
    });
  }

  async update(data: UpdateRoleRequest): Promise<GetRoleResponse> {
    // Kt nếu có permissionID nào đã soft delete thì không cho phép cập nhập
    if (data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissionIds,
          },
        },
      });

      const deletedPermission = permissions.filter(
        (permission) => permission.deletedAt,
      );
      if (deletedPermission.length > 0) {
        const deletedIds = deletedPermission
          .map((permission) => permission.id)
          .join(', ');
        throw new BadRequestException(
          `Permission with ids have been deleted : ${deletedIds}`,
        );
      }
    }
    return this.prismaService.role.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        name: data?.name,
        description: data?.description,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
        updatedById: data?.updatedById,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            path: true,
            method: true,
          },
        },
      },
    });
  }

  delete(data: DeleteRoleRequest): Promise<GetRoleResponse> {
    return this.prismaService.role.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        deletedById: data.deletedById,
        deletedAt: new Date(),
      },
      include: {
        permissions: {
          select: {
            id: true,
            path: true,
            method: true,
          },
        },
      },
    });
  }
}
