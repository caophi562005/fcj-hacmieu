import { PaymentMethodValues } from '@common/constants/payment.constant';
import {
  WalletTransactionSourceValues,
  WalletTransactionTypeValues,
} from '@common/constants/wallet.constant';
import {
  WebhookTransactionRequest,
  WebhookTransactionResponse,
} from '@common/interfaces/models/payment/transaction';
import {
  ORDER_MODULE_SERVICE_NAME,
  ORDER_SERVICE_PACKAGE_NAME,
  OrderModuleClient,
} from '@common/interfaces/proto-types/order';
import {
  WALLET_MODULE_SERVICE_NAME,
  WALLET_SERVICE_PACKAGE_NAME,
  WalletModuleClient,
} from '@common/interfaces/proto-types/wallet';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService implements OnModuleInit {
  private orderModule!: OrderModuleClient;
  private walletModule!: WalletModuleClient;

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly prismaService: PrismaService,
    @Inject(ORDER_SERVICE_PACKAGE_NAME)
    private readonly orderClient: ClientGrpc,
    @Inject(WALLET_SERVICE_PACKAGE_NAME)
    private readonly walletClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderModule = this.orderClient.getService<OrderModuleClient>(
      ORDER_MODULE_SERVICE_NAME,
    );
    this.walletModule = this.walletClient.getService<WalletModuleClient>(
      WALLET_MODULE_SERVICE_NAME,
    );
  }

  async receiver(
    data: WebhookTransactionRequest,
  ): Promise<WebhookTransactionResponse> {
    const transaction = await this.transactionRepository.receiver(data);

    const payment = await this.prismaService.payment.findUnique({
      where: { id: transaction.paymentId },
      select: {
        id: true,
        code: true,
        userId: true,
        method: true,
        amount: true,
        orderId: true,
      },
    });

    if (!payment) {
      return transaction;
    }

    if ((payment.orderId?.length ?? 0) > 0) {
      await firstValueFrom(
        this.orderModule.paidOrderByPayment({
          paymentId: payment.id,
        }),
      );
      return transaction;
    }

    if (payment.method === PaymentMethodValues.WALLET && payment.amount > 0) {
      await firstValueFrom(
        this.walletModule.adjustWallet({
          userId: payment.userId,
          type: WalletTransactionTypeValues.CREDIT,
          source: WalletTransactionSourceValues.TOPUP,
          referenceId: payment.id,
          amount: payment.amount,
          description: `Nạp V-Xu từ giao dịch ${payment.code}`,
        }),
      );
    }

    return transaction;
  }
}
