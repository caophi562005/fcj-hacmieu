import { Module } from '@nestjs/common';
import { ReportGrpcController } from './controllers/report-grpc.controller';
import { ReportRepository } from './repositories/report.repository';
import { ReportService } from './services/report.service';

@Module({
  controllers: [ReportGrpcController],
  providers: [ReportRepository, ReportService],
  exports: [ReportService],
})
export class ReportModule {}
