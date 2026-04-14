import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/constants/common.constant';
import {
  WebhookTransactionRequestDto,
  WebhookTransactionResponseDto,
} from '@common/interfaces/dtos/payment';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';

@Controller('payment/transaction')
@ApiTags('Payment/Transaction')
export class TransactionController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('receiver')
  @Auth([AuthType.PaymentAPIKey])
  @ApiOkResponse({
    type: WebhookTransactionResponseDto,
  })
  async receiver(@Body() body: WebhookTransactionRequestDto) {
    return this.paymentService.receiver(body);
  }
}
