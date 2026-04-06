import {
  DeleteManyPermissionsRequest,
  GetManyPermissionsRequest,
  GetManyPermissionsResponse,
} from '@common/interfaces/models/role/permission';
import { Injectable } from '@nestjs/common';
import { Permission, Prisma } from '@prisma-client/iam-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(
    data: GetManyPermissionsRequest,
  ): Promise<GetManyPermissionsResponse> {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const [totalItems, permissions] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
          roles: {
            some: {
              name: data.name,
            },
          },
        },
        skip,
        take,
        orderBy: {
          module: 'asc',
        },
      }),
    ]);
    return {
      permissions,
      totalItems,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  async listUnique(data: {
    names: Prisma.PermissionWhereUniqueInput['name'][];
  }): Promise<Pick<Permission, 'id' | 'method' | 'path'>[]> {
    return this.prismaService.permission.findMany({
      where: {
        OR: data.names.map((item) => ({
          name: item,
        })),
      },
      select: {
        id: true,
        path: true,
        method: true,
      },
    });
  }

  findById(
    where: Prisma.PermissionWhereUniqueInput,
  ): Promise<Permission | null> {
    return this.prismaService.permission.findUnique({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  create(data: Prisma.PermissionCreateInput): Promise<Permission> {
    return this.prismaService.permission.create({
      data,
    });
  }

  createMany(data: {
    permissions: Prisma.PermissionCreateInput[];
  }): Promise<Prisma.BatchPayload> {
    return this.prismaService.permission.createMany({
      data: data.permissions,
      skipDuplicates: true,
    });
  }

  update(data: Prisma.PermissionUpdateInput): Promise<Permission> {
    return this.prismaService.permission.update({
      where: {
        id: data.id as string,
        deletedAt: null,
        updatedById: data?.updatedById as string,
      },
      data,
    });
  }

  delete(
    data: Prisma.PermissionWhereInput,
    isHard?: boolean,
  ): Promise<Permission> {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id: data.id as string,
          },
        })
      : this.prismaService.permission.update({
          where: {
            id: data.id as string,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById: data.deletedById as string,
          },
        });
  }

  deleteMany(data: DeleteManyPermissionsRequest): Promise<Prisma.BatchPayload> {
    return this.prismaService.permission.deleteMany({
      where: {
        id: {
          in: data.ids,
        },
      },
    });
  }
}
