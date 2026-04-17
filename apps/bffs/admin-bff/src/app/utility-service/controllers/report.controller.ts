import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateReportRequestDto,
  GetManyReportsRequestDto,
  GetManyReportsResponseDto,
  GetReportRequestDto,
  ReportResponseDto,
  UpdateReportRequestDto,
} from '@common/interfaces/dtos/utility';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReportService } from '../services/report.service';

@Controller('utility/report')
@ApiTags('Utility/Report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyReportsResponseDto,
  })
  async getManyReports(
    @Query() queries: GetManyReportsRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.reportService.getManyReports({
      ...queries,
      userId,
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: ReportResponseDto,
  })
  async getReport(
    @Param() params: GetReportRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.reportService.getReport({
      ...params,
      processId,
    });
  }

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

  @Put(':id')
  @ApiOkResponse({
    type: ReportResponseDto,
  })
  async updateReport(
    @Param('id') id: string,
    @Body() body: UpdateReportRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.reportService.updateReport({
      ...body,
      id,
      processId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: ReportResponseDto,
  })
  async deleteReport(@Param('id') id: string, @ProcessId() processId: string) {
    return this.reportService.deleteReport({
      id,
      processId,
    });
  }
}
