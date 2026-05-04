import {
  CreateReportRequest,
  DeleteReportRequest,
  GetManyReportsRequest,
  GetManyReportsResponse,
  GetReportRequest,
  REPORT_SERVICE_NAME,
  ReportResponse,
  ReportServiceClient,
  UpdateReportRequest,
  UTILITY_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/utility';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReportService implements OnModuleInit {
  private reportModule!: ReportServiceClient;

  constructor(
    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private utilityClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reportModule =
      this.utilityClient.getService<ReportServiceClient>(REPORT_SERVICE_NAME);
  }

  async getManyReports(
    data: GetManyReportsRequest,
  ): Promise<GetManyReportsResponse> {
    return firstValueFrom(this.reportModule.getManyReports(data));
  }

  async getReport(data: GetReportRequest): Promise<ReportResponse> {
    return firstValueFrom(this.reportModule.getReport(data));
  }

  async createReport(data: CreateReportRequest): Promise<ReportResponse> {
    return firstValueFrom(this.reportModule.createReport(data));
  }

  async updateReport(data: UpdateReportRequest): Promise<ReportResponse> {
    return firstValueFrom(this.reportModule.updateReport(data));
  }

  async deleteReport(data: DeleteReportRequest): Promise<ReportResponse> {
    return firstValueFrom(this.reportModule.deleteReport(data));
  }
}
