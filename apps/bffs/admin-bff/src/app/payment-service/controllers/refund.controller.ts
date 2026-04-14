import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  CreateRefundRequestDto,
  GetManyRefundsRequestDto,
  GetManyRefundsResponseDto,
  GetRefundRequestDto,
  RefundResponseDto,
  UpdateRefundStatusRequestDto,
} from '@common/interfaces/dtos/payment';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';

@Controller('payment/refund')
@ApiTags('Payment/Refund')
export class RefundController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyRefundsResponseDto,
  })
  async getManyRefunds(
    @Query() queries: GetManyRefundsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.getManyRefunds({
      ...queries,
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: RefundResponseDto,
  })
  async getRefund(
    @Param() params: GetRefundRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.getRefund({
      ...params,
      processId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: RefundResponseDto,
  })
  async createRefund(
    @Body() body: CreateRefundRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.createRefund({
      ...body,
      processId,
    });
  }

  @Put('status')
  @ApiOkResponse({
    type: RefundResponseDto,
  })
  async updateRefundStatus(
    @Body() body: UpdateRefundStatusRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.paymentService.updateRefundStatus({
      ...body,
      processId,
    });
  }
}
