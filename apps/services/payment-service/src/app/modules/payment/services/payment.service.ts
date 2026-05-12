import { BankConfiguration } from '@common/configurations/bank.config';
import { PaymentMethodValues } from '@common/constants/payment.constant';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreatePaymentRequest,
  DeletePaymentRequest,
  GetManyPaymentsRequest,
  GetManyPaymentsResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  PaymentResponse,
  UpdatePaymentStatusRequest,
} from '@common/interfaces/models/payment';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async list(data: GetManyPaymentsRequest): Promise<GetManyPaymentsResponse> {
    const payments = await this.paymentRepository.list(data);
    if (payments.totalItems === 0) {
      throw new NotFoundException('Error.PaymentsNotFound');
    }
    return payments;
  }

  async getOne(data: GetPaymentRequest): Promise<GetPaymentResponse> {
    const payment = await this.paymentRepository.getOne(data);
    if (!payment) {
      throw new NotFoundException('Error.PaymentNotFound');
    }
    let qrCode = undefined;
    if (
      payment.method === PaymentMethodValues.ONLINE ||
      payment.method === PaymentMethodValues.WALLET
    ) {
      qrCode = `https://api.vietqr.io/${BankConfiguration.BANK_CODE}/${BankConfiguration.BANK_NUMBER}/${payment.amount}/${payment.code}.png`;
    }
    return { ...payment, qrCode };
  }

  async create({
    processId,
    ...data
  }: CreatePaymentRequest): Promise<PaymentResponse> {
    const createdPayment = await this.paymentRepository.create(data);
    return createdPayment;
  }

  async updateStatus(
    data: UpdatePaymentStatusRequest,
  ): Promise<PaymentResponse> {
    try {
      const payment = await this.paymentRepository.update(data);
      return payment;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.PaymentNotFound');
      }
      throw error;
    }
  }

  async delete(data: DeletePaymentRequest): Promise<PaymentResponse> {
    try {
      const deletedPayment = await this.paymentRepository.delete(data, false);
      // this.kafkaService.emit(QueueTopics.BRAND.DELETE_BRAND, deletedPayment);
      return deletedPayment;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.PaymentNotFound');
      }
      throw error;
    }
  }
}
