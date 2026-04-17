import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateReportRequest,
  GetManyReportsRequest,
  GetManyReportsResponse,
  GetReportRequest,
  ReportResponse,
  ResolveReportRequest,
  UpdateReportRequest,
} from '@common/interfaces/models/utility';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async list({
    processId,
    ...data
  }: GetManyReportsRequest): Promise<GetManyReportsResponse> {
    return this.reportRepository.list(data);
  }

  async findById({
    processId,
    ...data
  }: GetReportRequest): Promise<ReportResponse> {
    const report = await this.reportRepository.findById(data);

    if (!report) {
      throw new NotFoundException('Error.ReportNotFound');
    }

    return report;
  }

  async create({
    processId,
    ...data
  }: CreateReportRequest): Promise<ReportResponse> {
    return this.reportRepository.create(data);
  }

  async update({
    processId,
    ...data
  }: UpdateReportRequest): Promise<ReportResponse> {
    try {
      return await this.reportRepository.update(data);
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ReportNotFound');
      }
      throw error;
    }
  }

  async resolve({
    processId,
    ...data
  }: ResolveReportRequest): Promise<ReportResponse> {
    try {
      return await this.reportRepository.resolve(data);
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ReportNotFound');
      }
      throw error;
    }
  }

  async delete(data: GetReportRequest): Promise<ReportResponse> {
    try {
      return await this.reportRepository.delete(data, false);
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ReportNotFound');
      }
      throw error;
    }
  }
}
