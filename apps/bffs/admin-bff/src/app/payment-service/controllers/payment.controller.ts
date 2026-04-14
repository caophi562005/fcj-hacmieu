import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  CreatePaymentRequestDto,
  DashboardPaymentRequestDto,
  DashboardPaymentResponseDto,
  GetManyPaymentsRequestDto,
  GetManyPaymentsResponseDto,
  GetPaymentRequestDto,
  GetPaymentResponseDto,
  PaymentResponseDto,
  UpdatePaymentStatusRequestDto,
} from '@common/interfaces/dtos/payment';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';

@Controller('payment/payment')
@ApiTags('Payment/Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyPaymentsResponseDto,
  })
  async getManyPayments(
    @Query() queries: GetManyPaymentsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.getManyPayments({
      ...queries,
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: GetPaymentResponseDto,
  })
  async getPayment(
    @Param() params: GetPaymentRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.getPayment({
      ...params,
      processId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: PaymentResponseDto,
  })
  async createPayment(
    @Body() body: CreatePaymentRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.createPayment({
      ...body,
      processId,
    });
  }

  @Put('status')
  @ApiOkResponse({
    type: PaymentResponseDto,
  })
  async updatePaymentStatus(
    @Body() body: UpdatePaymentStatusRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.updatePaymentStatus({
      ...body,
      processId,
    });
  }

  @Get('dashboard/summary')
  @ApiOkResponse({
    type: DashboardPaymentResponseDto,
  })
  async dashboardPayment(
    @Query() queries: DashboardPaymentRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.dashboardPayment({
      ...queries,
      processId,
    });
  }
}
