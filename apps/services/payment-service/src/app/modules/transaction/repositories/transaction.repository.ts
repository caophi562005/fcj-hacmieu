import { WebhookTransactionRequest } from '@common/interfaces/models/payment/transaction';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parse } from 'date-fns';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async receiver(data: WebhookTransactionRequest) {
    let amountIn = 0;
    let amountOut = 0;
    if (data.transferType === 'in') {
      amountIn = data.transferAmount;
    } else if (data.transferType === 'out') {
      amountOut = data.transferAmount;
    }

    // Ưu tiên mã do cổng thanh toán gửi, sau đó mới trích từ nội dung.
    const extractedCode = data.content?.match(/[A-Z]+\d{6}[A-Z0-9]{6}/)?.[0];
    const paymentCode = data.code
      ? String(data.code)
      : (extractedCode ?? String(data.content));
    const transactionDate = parse(
      data.transactionDate,
      'yyyy-MM-dd HH:mm:ss',
      new Date(),
    );

    try {
      await this.prismaService.$queryRaw`
        CALL sp_process_bank_transaction(
          ${data.id}, ${data.gateway}, ${transactionDate},
          ${data.accountNumber ?? null}, ${data.subAccount ?? null},
          ${amountIn}, ${amountOut}, ${data.accumulated},
          ${data.code ?? null}, ${paymentCode}, ${data.content ?? null},
          ${data.referenceCode ?? null}, ${data.description ?? null}
        )
      `;
    } catch (error) {
      const message = String(error);
      if (message.includes('Duplicate entry')) {
        throw new NotFoundException('Error.TransactionAlreadyExists');
      }
      if (message.includes('PAYMENT_NOT_FOUND')) {
        throw new NotFoundException('Error.PaymentNotFound');
      }
      if (message.includes('PAYMENT_AMOUNT_MISMATCH')) {
        throw new BadRequestException('Error.AmountPriceMismatch');
      }
      throw error;
    }

    const payment = await this.prismaService.payment.findUnique({
      where: { code: paymentCode },
    });
    if (!payment) throw new NotFoundException('Error.PaymentNotFound');

    return {
      paymentCode,
      paymentId: payment.id,
      userId: payment.userId,
      message: 'Message.ReceivedSuccessfully',
    };
  }
}
