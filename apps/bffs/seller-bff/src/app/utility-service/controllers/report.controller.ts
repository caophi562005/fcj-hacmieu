import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateReportRequestDto,
  ReportResponseDto,
} from '@common/interfaces/dtos/utility';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReportService } from '../services/report.service';

@Controller('utility/report')
@ApiTags('Utility/Report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOkResponse({
    type: ReportResponseDto,
  })
  async createReport(
    @Body() body: CreateReportRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.reportService.createReport({
      ...body,
      reporterId: userId,
      processId,
    });
  }
}
