import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateReportRequest,
  GetManyReportsRequest,
  GetReportRequest,
  ResolveReportRequest,
  UpdateReportRequest,
} from '@common/interfaces/models/utility';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReportService } from '../services/report.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class ReportGrpcController {
  constructor(private readonly reportService: ReportService) {}

  @GrpcMethod(GrpcModuleName.UTILITY.REPORT, 'GetManyReports')
  getManyReports(data: GetManyReportsRequest) {
    return this.reportService.list(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REPORT, 'GetReport')
  getReport(data: GetReportRequest) {
    return this.reportService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REPORT, 'CreateReport')
  createReport(data: CreateReportRequest) {
    return this.reportService.create(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REPORT, 'UpdateReport')
  updateReport(data: UpdateReportRequest) {
    return this.reportService.update(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REPORT, 'ResolveReport')
  resolveReport(data: ResolveReportRequest) {
    return this.reportService.resolve(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.REPORT, 'DeleteReport')
  deleteReport(data: GetReportRequest) {
    return this.reportService.delete(data);
  }
}
