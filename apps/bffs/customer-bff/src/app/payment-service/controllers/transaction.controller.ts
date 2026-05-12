import { AuthType } from '@common/constants/common.constant';
import { Auth } from '@common/decorators/auth.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  WebhookTransactionRequestDto,
  WebhookTransactionResponseDto,
} from '@common/interfaces/dtos/payment';
import { Body, Controller, MessageEvent, Post, Sse } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { filter, map, Observable } from 'rxjs';
import { PaymentStreamService } from '../services/payment-stream.service';
import { PaymentService } from '../services/payment.service';

@Controller('payment/transaction')
@ApiTags('Payment/Transaction')
export class TransactionController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentStreamService: PaymentStreamService,
  ) {}

  @Post('receiver')
  @Auth([AuthType.PaymentAPIKey])
  @ApiOkResponse({
    type: WebhookTransactionResponseDto,
  })
  async receiver(@Body() body: WebhookTransactionRequestDto) {
    const result = await this.paymentService.receiver(body);
    this.paymentStreamService.publish(result);
    return result;
  }

  @Sse('sse')
  handle(@UserData('userId') userId: string): Observable<MessageEvent> {
    return this.paymentStreamService.stream().pipe(
      filter((evt) => (evt.data as { userId?: string })?.userId === userId),
      map((evt) => ({
        ...evt,
        data: evt.data,
      })),
    );
  }
}
