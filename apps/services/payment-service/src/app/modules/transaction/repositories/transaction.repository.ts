import { PaymentStatusValues } from '@common/constants/payment.constant';
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
    if (data.transferType !== 'in') {
      throw new BadRequestException('Error.InvalidInboundTransferDirection');
    }
    const amountIn = data.transferAmount;
    const amountOut = 0;

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: data.id,
      },
    });

    if (transaction) {
      if (!transaction.paymentId) {
        throw new NotFoundException('Error.PaymentNotFound');
      }
      const duplicatePayment = await this.prismaService.payment.findUnique({
        where: { id: transaction.paymentId },
      });
      if (!duplicatePayment) throw new NotFoundException('Error.PaymentNotFound');
      return {
        paymentCode: duplicatePayment.code,
        paymentId: duplicatePayment.id,
        userId: duplicatePayment.userId,
        shouldConfirmOrder: false,
        message: 'Message.ReceivedSuccessfully',
      };
    }

    const result = await this.prismaService.$transaction(async (tx) => {
      // Kiểm tra nội dung chuyển tiền và tổng số tiền có khớp không
      // data.code là mã SePay gán, data.content là nội dung chuyển khoản
      // Ưu tiên tìm payment code (dạng PREFIX + YYMMDD + 6 chars) trong content
      const extractedCode = data.content?.match(/[A-Z]+\d{6}[A-Z0-9]{6}/)?.[0];
      const paymentCode = data.code
        ? String(data.code)
        : (extractedCode ?? String(data.content));
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

      const paid = await tx.payment.updateMany({
        where: { id: payment.id, status: PaymentStatusValues.PENDING },
        data: {
          status: PaymentStatusValues.SUCCESS,
        },
      });
      if (paid.count === 1) {
        await tx.paymentAllocation.updateMany({
          where: { paymentId: payment.id, status: 'PENDING' },
          data: { status: 'SUCCESS' },
        });
      }

      await tx.transaction.create({
        data: {
          id: data.id,
          gateway: data.gateway,
          transactionDate: parse(
            data.transactionDate,
            'yyyy-MM-dd HH:mm:ss',
            new Date(),
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
          paymentId: payment.id,
          eligibleForOrderConfirmation: paid.count === 1,
        },
      });

      return {
        paymentCode,
        paymentId: payment.id,
        userId: payment.userId,
        shouldConfirmOrder: paid.count === 1,
        message: 'Message.ReceivedSuccessfully',
      };
    });

    return result;
  }
}
