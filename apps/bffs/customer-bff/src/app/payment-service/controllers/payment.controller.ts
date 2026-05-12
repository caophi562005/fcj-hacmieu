import {
  PaymentMethodValues,
  PaymentStatusValues,
} from '@common/constants/payment.constant';
import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  GetPaymentRequestDto,
  GetPaymentResponseDto,
} from '@common/interfaces/dtos/payment';
import { generateCode } from '@common/utils/order-code.util';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { PaymentService } from '../services/payment.service';

@Controller('payment/payment')
@ApiTags('Payment/Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':id')
  @ApiOkResponse({
    type: GetPaymentResponseDto,
  })
  async getPayment(
    @Param() params: GetPaymentRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.paymentService.getPayment({
      ...params,
      processId,
      userId,
    });
  }

  @Post('topup')
  async createTopup(
    @Body() body: { amount: number },
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    const id = uuidv4();
    const code = generateCode('TOPUP');
    const payment = await this.paymentService.createPayment({
      processId,
      id,
      code,
      userId,
      orderId: [],
      method: PaymentMethodValues.WALLET,
      status: PaymentStatusValues.PENDING,
      amount: body.amount,
    });
    return payment;
  }
}
