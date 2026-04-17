import {
  GetManyReportsRequest,
  GetReportRequest,
  ResolveReportRequest,
} from '@common/interfaces/models/utility';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/utility-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyReportsRequest) {
    const page = data.page || 1;
    const limit = data.limit || 10;
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
      reports,
    };
  }

  findById(data: GetReportRequest) {
    return this.prismaService.report.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });
  }

  create(data: Prisma.ReportCreateInput) {
    return this.prismaService.report.create({
      data,
    });
  }

  update(data: {
    id: string;
    status: string;
    assigneeAdminId?: string;
    action?: string;
  }) {
    return this.prismaService.report.update({
      where: { id: data.id },
      data: {
        status: data.status as any,
        assigneeAdminId: data.assigneeAdminId,
        action: data.action,
      },
    });
  }

  resolve(data: ResolveReportRequest) {
    return this.prismaService.report.update({
      where: { id: data.id },
      data: {
        status: 'RESOLVED' as any,
        closedAt: new Date(),
        action: data.action,
      },
    });
  }

  delete(data: { id: string }, softDelete = true) {
    if (softDelete) {
      return this.prismaService.report.update({
        where: { id: data.id },
        data: { deletedAt: new Date() },
      });
    }
    return this.prismaService.report.delete({
      where: { id: data.id },
    });
  }
}
