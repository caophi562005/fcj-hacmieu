import { PaginationConfiguration } from '@common/configurations/pagination.config';
import { GroupType } from '@common/constants/user.constant';
import {
  GetManyUsersRequest,
  GetUserRequest,
} from '@common/interfaces/models/iam';
import { readStringList } from '@common/utils/scalar-list.util';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/iam-service';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Đưa `group` từ cột JSON về `GroupType[]` để hợp đồng gRPC và `UserSchema` không
 * đổi.
 *
 * Trên PostgreSQL đây là `GROUP[]`, nay là cột JSON vì MySQL không có kiểu mảng.
 */
function toUserRow<T extends { id: string; group: unknown }>(
  row: T,
): Omit<T, 'group'> & { group: GroupType[] } {
  return {
    ...row,
    group: readStringList(row.group, {
      model: 'User',
      field: 'group',
      key: row.id,
    }) as GroupType[],
  };
}

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async find(data: GetUserRequest) {
    const where: Prisma.UserWhereUniqueInput = {
      id: data?.id || undefined,
      email: data?.email || undefined,
      username: data?.username || undefined,
    };
    const row = await this.prismaService.user.findUnique({ where });
    return row ? toUserRow(row) : null;
  }

  async list(data: GetManyUsersRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      email: data?.email || undefined,
      username: data?.username || undefined,
      gender: data?.gender || undefined,
      status: data?.status || undefined,
      id: data?.ids?.length
        ? {
            in: data.ids,
          }
        : undefined,
      // `hasSome` chỉ tồn tại cho scalar list của PostgreSQL. Trên cột JSON của
      // MySQL, tương đương là "khớp ít nhất một giá trị", biểu diễn bằng OR của
      // các `array_contains`. Vẫn có kiểu và không cần raw SQL.
      ...(data?.group?.length
        ? {
            OR: data.group.map((group) => ({
              group: { array_contains: group },
            })),
          }
        : {}),
    };

    const [totalItems, users] = await Promise.all([
      this.prismaService.user.count({
        where,
      }),
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      users: users.map(toUserRow),
      totalItems,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  async create(data: Prisma.UserCreateInput) {
    return toUserRow(await this.prismaService.user.create({ data }));
  }

  async update(data: Prisma.UserUpdateInput) {
    return toUserRow(
      await this.prismaService.user.update({
        where: { id: data.id as string },
        data,
      }),
    );
  }
}
