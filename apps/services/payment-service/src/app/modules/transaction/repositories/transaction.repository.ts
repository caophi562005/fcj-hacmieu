import { PaymentStatusValues } from '@common/constants/payment.constant';
import { WebhookTransactionRequest } from '@common/interfaces/models/payment/transaction';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parse } from 'date-fns';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentProducer } from '../../payment/producers/payment.producer';

@Injectable()
export class TransactionRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentProducer: PaymentProducer
  ) {}
  async receiver(data: WebhookTransactionRequest) {
    let amountIn = 0;
    let amountOut = 0;
    if (data.transferType === 'in') {
      amountIn = data.transferAmount;
    } else if (data.transferType === 'out') {
      amountOut = data.transferAmount;
    }

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: data.id,
      },
    });

    if (transaction) {
      throw new NotFoundException('Error.TransactionAlreadyExists');
    }

    const result = await this.prismaService.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          id: data.id,
          gateway: data.gateway,
          transactionDate: parse(
            data.transactionDate,
            'yyyy-MM-dd HH:mm:ss',
            new Date()
          ),
          accountNumber: data.accountNumber,
          subAccount: data.subAccount,
          amountIn,
          amountOut,
          accumulated: data.accumulated,
          code: data.code,
          transactionContent: data.content,
          referenceNumber: data.referenceCode,
          body: data.description,
        },
      });

      // Kiểm tra nội dung chuyển tiền và tổng số tiền có khớp không
      const paymentCode = data.code ? String(data.code) : String(data.content);
      const payment = await tx.payment.findUnique({
        where: {
          code: paymentCode,
        },
      });
      if (!payment) {
        throw new NotFoundException('Error.PaymentNotFound');
      }
      const { amount } = payment;
      if (amount !== data.transferAmount) {
        throw new BadRequestException('Error.AmountPriceMismatch');
      }

      await Promise.all([
        tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: PaymentStatusValues.SUCCESS,
          },
        }),
        this.paymentProducer.removeJob(payment.id),
      ]);

      return {
        paymentCode,
        paymentId: payment.id,
        userId: payment.userId,
        message: 'Message.ReceivedSuccessfully',
      };
    });

    return result;
  }
}
