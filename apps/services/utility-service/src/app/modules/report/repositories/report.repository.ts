import { PaginationConfiguration } from '@common/configurations/pagination.config';
import {
  GetManyReportsRequest,
  GetReportRequest,
  ResolveReportRequest,
} from '@common/interfaces/models/utility';
import { readStringList } from '@common/utils/scalar-list.util';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/utility-service';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Đưa `media` từ cột JSON về `string[]` để hợp đồng gRPC không đổi.
 *
 * Trên PostgreSQL đây là `String[] @default([])`, nay là cột JSON vì MySQL không
 * có kiểu mảng và cũng không nhận default hằng cho JSON.
 */
function toReportRow<T extends { id: string; media: unknown }>(
  row: T,
): Omit<T, 'media'> & { media: string[] } {
  return {
    ...row,
    media: readStringList(row.media, {
      model: 'Report',
      field: 'media',
      key: row.id,
    }),
  };
}

@Injectable()
export class ReportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyReportsRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const [reports, totalItems] = await Promise.all([
      this.prismaService.report.findMany({
        where: {
          ...(data.userId && { reporterId: data.userId }),
          ...(data.status && { status: data.status }),
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.report.count({
        where: {
          ...(data.userId && { reporterId: data.userId }),
          ...(data.status && { status: data.status }),
          deletedAt: null,
        },
      }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      reports: reports.map(toReportRow),
    };
  }

  async findById(data: GetReportRequest) {
    const row = await this.prismaService.report.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });
    return row ? toReportRow(row) : null;
  }

  async create(data: Prisma.ReportCreateInput) {
    return toReportRow(await this.prismaService.report.create({ data }));
  }

  async update(data: {
    id: string;
    status: string;
    assigneeAdminId?: string;
    action?: string;
  }) {
    return toReportRow(
      await this.prismaService.report.update({
        where: { id: data.id },
        data: {
          status: data.status as any,
          assigneeAdminId: data.assigneeAdminId,
          action: data.action,
        },
      }),
    );
  }

  async resolve(data: ResolveReportRequest) {
    return toReportRow(
      await this.prismaService.report.update({
        where: { id: data.id },
        data: {
          status: 'RESOLVED' as any,
          closedAt: new Date(),
          action: data.action,
        },
      }),
    );
  }

  async delete(data: { id: string }, softDelete = true) {
    const row = softDelete
      ? await this.prismaService.report.update({
          where: { id: data.id },
          data: { deletedAt: new Date() },
        })
      : await this.prismaService.report.delete({
          where: { id: data.id },
        });

    return toReportRow(row);
  }
}
