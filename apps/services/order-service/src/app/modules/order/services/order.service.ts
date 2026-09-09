import { AppConfiguration } from '@common/configurations/app.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { OrderStatusValues } from '@common/constants/order.constant';
import { PaymentStatusValues } from '@common/constants/payment.constant';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import { DiscountTypeValues } from '@common/constants/promotion.constant';
import {
  SHOP_MODULE_SERVICE_NAME,
  SHOP_SERVICE_PACKAGE_NAME,
  ShopModuleClient,
} from '@common/interfaces/proto-types/shop';
import {
  WalletTransactionSourceValues,
  WalletTransactionTypeValues,
} from '@common/constants/wallet.constant';
import {
  CancelOrderRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  GetManyOrdersRequest,
  GetManyOrdersResponse,
  GetOrderRequest,
  GetOrderResponse,
  UpdateStatusOrderRequest,
} from '@common/interfaces/models/order';
import { CreatePromotionRedemptionRequest } from '@common/interfaces/models/promotion';
import { AdjustWalletRequest } from '@common/interfaces/models/wallet';
import {
  CATALOG_SERVICE_PACKAGE_NAME,
  PRODUCT_MODULE_SERVICE_NAME,
  ProductModuleClient,
} from '@common/interfaces/proto-types/catalog';
import {
  PROMOTION_MODULE_SERVICE_NAME,
  PROMOTION_SERVICE_PACKAGE_NAME,
  PromotionModuleClient,
} from '@common/interfaces/proto-types/promotion';
import {
  NOTIFICATION_SERVICE_NAME,
  NotificationServiceClient,
  UTILITY_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/utility';
import {
  PLATFORM_LEDGER_MODULE_SERVICE_NAME,
  PlatformLedgerModuleClient,
  WALLET_MODULE_SERVICE_NAME,
  WALLET_SERVICE_PACKAGE_NAME,
  WalletModuleClient,
} from '@common/interfaces/proto-types/wallet';
import { generatePaymentCode } from '@common/utils/payment-code.util';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { SqsService } from '@ssut/nestjs-sqs';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { CartItemService } from '../../cart/services/cart-item.service';
import { OrderRepository } from '../repositories/order.repository';

@Injectable()
export class OrderService implements OnModuleInit {
  private productModule!: ProductModuleClient;
  private promotionModule!: PromotionModuleClient;
  private walletModule!: WalletModuleClient;
  private platformLedgerModule!: PlatformLedgerModuleClient;
  private notificationModule!: NotificationServiceClient;
  private shopModule!: ShopModuleClient;

  constructor(
    @Inject(CATALOG_SERVICE_PACKAGE_NAME)
    private catalogClient: ClientGrpc,

    @Inject(PROMOTION_SERVICE_PACKAGE_NAME)
    private promotionClient: ClientGrpc,

    @Inject(WALLET_SERVICE_PACKAGE_NAME)
    private walletClient: ClientGrpc,

    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private utilityClient: ClientGrpc,

    @Inject(SHOP_SERVICE_PACKAGE_NAME)
    private shopClient: ClientGrpc,

    private readonly orderRepository: OrderRepository,
    private readonly cartItemService: CartItemService,

    private readonly sqsService: SqsService,
  ) {}

  onModuleInit() {
    this.productModule = this.catalogClient.getService<ProductModuleClient>(
      PRODUCT_MODULE_SERVICE_NAME,
    );
    this.promotionModule =
      this.promotionClient.getService<PromotionModuleClient>(
        PROMOTION_MODULE_SERVICE_NAME,
      );
    this.walletModule = this.walletClient.getService<WalletModuleClient>(
      WALLET_MODULE_SERVICE_NAME,
    );
    this.platformLedgerModule =
      this.walletClient.getService<PlatformLedgerModuleClient>(
        PLATFORM_LEDGER_MODULE_SERVICE_NAME,
      );
    this.notificationModule =
      this.utilityClient.getService<NotificationServiceClient>(
        NOTIFICATION_SERVICE_NAME,
      );
    this.shopModule = this.shopClient.getService<ShopModuleClient>(
      SHOP_MODULE_SERVICE_NAME,
    );
  }

  private async sendQueueMessage<T>(queueName: string, body: T) {
    try {
      await this.sqsService.send(queueName, {
        id: uuidv4(),
        body,
        delaySeconds: 0,
      });
    } catch (error) {
      console.error(`Error sending message to ${queueName}:`, error);
      throw new InternalServerErrorException('Error.SendOrderMessageFailed');
    }
  }

  private async calculateShippingFee(
    items: Array<{
      weightGram: number;
      quantity: number;
    }>,
    origin: { districtId: number; wardCode: string },
    destination: { districtId: number; wardCode: string },
  ): Promise<number> {
    const token = process.env.GHN_API_KEY;
    const shopId = process.env.GHN_SHOP_ID;
    if (!token || !shopId) {
      throw new InternalServerErrorException('Error.GhnConfigurationMissing');
    }

    const baseUrl =
      process.env.GHN_API_BASE_URL ??
      'https://dev-online-gateway.ghn.vn/shiip/public-api';

    try {
      const weight = items.reduce(
        (sum, item) => sum + item.weightGram * item.quantity,
        0,
      );
      const { data } = await axios.post(
        `${baseUrl}/v2/shipping-order/fee`,
        {
          service_type_id: 2,
          from_district_id: origin.districtId,
          from_ward_code: origin.wardCode,
          to_district_id: destination.districtId,
          to_ward_code: destination.wardCode,
          weight,
          insurance_value: 0,
        },
        { headers: { Token: token, ShopId: shopId } },
      );
      return Number(data?.data?.total ?? 0);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      throw new BadRequestException(message || 'Error.GhnCalculateFeeFailed');
    }
  }

  async list({
    processId,
    ...data
  }: GetManyOrdersRequest): Promise<GetManyOrdersResponse> {
    const orders = await this.orderRepository.list(data);
    if (orders.totalItems === 0) {
      throw new NotFoundException('Error.OrdersNotFound');
    }
    return orders;
  }

  async findById({
    processId,
    ...data
  }: GetOrderRequest): Promise<GetOrderResponse> {
    const order = await this.orderRepository.findById(data);
    if (!order) {
      throw new NotFoundException('Error.OrderNotFound');
    }
    return order;
  }

  async create({
    processId,
    userId,
    ...data
  }: CreateOrderRequest): Promise<CreateOrderResponse> {
    const requestedCoin = Math.max(0, Math.floor(data.coin ?? 0));
    if (requestedCoin > 0) {
      const wallet = await firstValueFrom(
        this.walletModule.getMyWallet({
          processId,
          userId,
        }),
      );

      if ((wallet.balance ?? 0) < requestedCoin) {
        throw new BadRequestException('Error.WalletInsufficientBalance');
      }
    }

    const cartItemIds = Array.from(
      new Set(data.orders.flatMap((item) => item.cartItemIds)),
    );
    const cartItems = await this.cartItemService.validateCartItems({
      processId,
      cartItemIds,
      userId,
    });

    const productIds = cartItems.cartItems.map((item) => ({
      productId: item.productId,
      skuId: item.skuId,
      quantity: item.quantity,
      cartItemId: item.id,
    }));

    const productsResult = await firstValueFrom(
      this.productModule.validateProducts({
        processId,
        productIds,
      }),
    );

    if (productsResult.isValid === false) {
      throw new BadRequestException(
        'Some products are invalid or out of stock',
      );
    }

    const validatedItemByCartItemId = new Map(
      productsResult.items.map((item) => [item.cartItemId, item]),
    );

    // Tính itemTotal cho từng order bằng map để tránh filter lặp nhiều lần.
    const ordersWithTotal = await Promise.all(
      data.orders.map(async (order) => {
        const shop = await firstValueFrom(
          this.shopModule.getShop({ processId, id: order.shopId }),
        );
        if (
          !shop.pickupAddress ||
          !shop.pickupProvinceId ||
          !shop.pickupDistrictId ||
          !shop.pickupWardId
        ) {
          throw new BadRequestException('Error.ShopPickupAddressIncomplete');
        }
        const orderItems = order.cartItemIds
          .map((id) => validatedItemByCartItemId.get(id))
          .filter((item) => item && item.shopId === order.shopId);

        const itemTotal = orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        return {
          shopId: order.shopId,
          items: orderItems,
          itemTotal,
          shippingFee: await this.calculateShippingFee(
            orderItems,
            {
              districtId: shop.pickupDistrictId,
              wardCode: String(shop.pickupWardId),
            },
            {
              districtId: data.shippingAddress.districtId,
              wardCode: data.shippingAddress.wardCode,
            },
          ),
          shippingOrigin: {
            provinceId: shop.pickupProvinceId,
            districtId: shop.pickupDistrictId,
            wardId: shop.pickupWardId,
            address: shop.pickupAddress,
            ...(shop.pickupLatitude != null
              ? { latitude: shop.pickupLatitude }
              : {}),
            ...(shop.pickupLongitude != null
              ? { longitude: shop.pickupLongitude }
              : {}),
          },
          shippingDestination: {
            provinceId: data.shippingAddress.provinceId,
            districtId: data.shippingAddress.districtId,
            wardId: Number(data.shippingAddress.wardCode),
            address: data.receiver.address,
            ...(data.receiver.latitude != null
              ? { latitude: data.receiver.latitude }
              : {}),
            ...(data.receiver.longitude != null
              ? { longitude: data.receiver.longitude }
              : {}),
          },
          discount: 0, // Sẽ được tính sau
        };
      }),
    );

    // Check promotion và phân bổ discount
    let promotionData: {
      id: string;
      code: string;
      discountType: string;
      discountValue: number;
      minOrderSubtotal: number;
      maxDiscount?: number;
    } | null = null;
    if (data.discountCode) {
      const promotion = await firstValueFrom(
        this.promotionModule.checkPromotion({
          processId,
          code: data.discountCode,
          userId,
        }),
      );

      // Tính tổng subtotal của tất cả orders
      const totalSubtotal = ordersWithTotal.reduce(
        (sum, order) => sum + order.itemTotal,
        0,
      );

      if (totalSubtotal < promotion.minOrderSubtotal) {
        throw new BadRequestException(
          `Minimum order subtotal is ${promotion.minOrderSubtotal}`,
        );
      }

      // Tính discount value
      let discountAmount = 0;
      if (promotion.discountType === DiscountTypeValues.PERCENT) {
        // basis points: 1000 = 10%
        discountAmount = Math.floor(
          (totalSubtotal * promotion.discountValue) / 10000,
        );
        // Apply maxDiscount nếu có
        if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
          discountAmount = promotion.maxDiscount;
        }
      } else {
        // AMOUNT
        discountAmount = promotion.discountValue;
      }

      // Phân bổ discount theo thứ tự ưu tiên (giảm order nhỏ trước)
      const sortedOrders = [...ordersWithTotal].sort(
        (a, b) => a.itemTotal - b.itemTotal,
      );
      let remainingDiscount = discountAmount;

      sortedOrders.forEach((order) => {
        const orderTotal = order.itemTotal + order.shippingFee;
        if (remainingDiscount >= orderTotal) {
          // Giảm hết order này
          order.discount = -orderTotal;
          remainingDiscount -= orderTotal;
        } else if (remainingDiscount > 0) {
          // Giảm 1 phần
          order.discount = -remainingDiscount;
          remainingDiscount = 0;
        }
      });

      // Cập nhật lại ordersWithTotal với discount đã phân bổ
      ordersWithTotal.forEach((order) => {
        const sortedOrder = sortedOrders.find(
          (so) => so.shopId === order.shopId,
        );
        if (sortedOrder) {
          order.discount = sortedOrder.discount;
        }
      });

      promotionData = {
        id: promotion.id,
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        minOrderSubtotal: promotion.minOrderSubtotal,
        maxDiscount: promotion.maxDiscount,
      };
    }

    if (requestedCoin > 0) {
      let remainingCoin = requestedCoin;
      const sortedOrders = [...ordersWithTotal].sort(
        (a, b) => a.itemTotal - b.itemTotal,
      );

      sortedOrders.forEach((order) => {
        if (remainingCoin <= 0) return;

        const orderPayableAfterDiscount = Math.max(
          0,
          order.itemTotal + order.shippingFee + order.discount,
        );

        if (orderPayableAfterDiscount <= 0) return;

        const applied = Math.min(remainingCoin, orderPayableAfterDiscount);
        order.discount -= applied;
        remainingCoin -= applied;
      });

      ordersWithTotal.forEach((order) => {
        const sortedOrder = sortedOrders.find(
          (so) => so.shopId === order.shopId,
        );
        if (sortedOrder) {
          order.discount = sortedOrder.discount;
        }
      });
    }

    const paymentId = uuidv4();
    const paymentCode = generatePaymentCode();

    const mergedData = {
      userId,
      receiver: data.receiver,
      paymentMethod: data.paymentMethod,
      paymentId,
      orders: ordersWithTotal,
    };

    const createdOrders = await this.orderRepository.create(mergedData);

    if (requestedCoin > 0 && createdOrders.length > 0) {
      const actuallyAppliedCoin = Math.max(
        0,
        Math.floor(
          createdOrders.reduce(
            (sum, order) => sum + Math.max(0, -(order.discount ?? 0)),
            0,
          ),
        ),
      );

      if (actuallyAppliedCoin > 0) {
        const debitPayload: AdjustWalletRequest = {
          processId,
          userId,
          type: WalletTransactionTypeValues.DEBIT,
          source: WalletTransactionSourceValues.ORDER_PAYMENT,
          referenceId: createdOrders.map((order) => order.id).join(','),
          amount: actuallyAppliedCoin,
          description:
            createdOrders.length === 1
              ? `Thanh toán đơn hàng ${createdOrders[0].code} bằng V-Xu`
              : `Thanh toán ${createdOrders.length} đơn hàng bằng V-Xu`,
        };

        await firstValueFrom(this.walletModule.adjustWallet(debitPayload));
      }
    }

    // Tạo PromotionRedemption nếu có promotion
    if (promotionData && createdOrders.length > 0) {
      const redemption: CreatePromotionRedemptionRequest = {
        userId,
        code: promotionData.code,
        promotionId: promotionData.id,
        orderIds: createdOrders.map((order) => order.id),
        discountType: promotionData.discountType as
          | typeof DiscountTypeValues.PERCENT
          | typeof DiscountTypeValues.AMOUNT,
        discountValue: promotionData.discountValue,
        minOrderSubtotal: promotionData.minOrderSubtotal,
        maxDiscount: promotionData.maxDiscount,
      };
      await this.sendQueueMessage(
        SqsConfiguration.CREATE_REDEMPTION_QUEUE_NAME,
        redemption,
      );
    }

    await this.sendQueueMessage(SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME, {
      id: paymentId,
      processId,
      userId,
      code: paymentCode,
      orderId: createdOrders.map((order) => order.id),
      method: data.paymentMethod,
      status: PaymentStatusValues.PENDING,
      amount: createdOrders.reduce((sum, order) => sum + order.grandTotal, 0),
    });

    await Promise.all(
      createdOrders.map((order) =>
        this.sendQueueMessage(SqsConfiguration.CREATE_ORDER_QUEUE_NAME, {
          processId,
          userId: order.userId,
          items: order.items,
        }),
      ),
    );

    return { orders: createdOrders };
  }

  async cancelOrdersByPayment(data: { paymentId: string }) {
    const orders = await this.orderRepository.listCancel({
      paymentId: data.paymentId,
    });

    if (orders.length === 0) {
      throw new NotFoundException('Error.OrdersNotFound');
    }

    const orderIds = orders.map((order) => order.id);
    const userId = orders[0].userId;

    const cancelledOrders = await this.orderRepository.cancel(orderIds, userId);

    return { orders: cancelledOrders };
  }

  async cancelOrder({ processId, ...data }: CancelOrderRequest) {
    const orderIds = [data.orderId];
    const userId = data.userId || undefined;
    const shopId = data.shopId || undefined;
    const cancelledOrders = await this.orderRepository.cancel(
      orderIds,
      userId,
      shopId,
    );

    return { orders: cancelledOrders };
  }

  async paid(data: { paymentId: string }) {
    const orders = await this.orderRepository.paid(data);
    // await Promise.all(
    //   orders.map((order) =>
    //     this.kafkaService.emit(QueueTopics.ORDER.UPDATE_ORDER, order),
    //   ),
    // );
    return { orders };
  }

  async updateStatus({ processId, ...data }: UpdateStatusOrderRequest) {
    try {
      const order = await this.orderRepository.updateStatus(data, {
        commissionRate: AppConfiguration.ORDER_SELLER_COMMISSION_PERCENT,
        taxRate: AppConfiguration.ORDER_SELLER_TAX_PERCENT,
      });

      if (order.status === OrderStatusValues.COMPLETED) {
        const soldCounts =
          await this.orderRepository.getCompletedSoldCountsForOrder(order.id);
        await firstValueFrom(
          this.productModule.updateSoldCounts({ items: soldCounts }),
        );

        const grossAmount = order.itemTotal;
        const commissionFee = Math.floor(
          (grossAmount * AppConfiguration.ORDER_SELLER_COMMISSION_PERCENT) /
            100,
        );
        const taxWithheld = Math.floor(
          (grossAmount * AppConfiguration.ORDER_SELLER_TAX_PERCENT) / 100,
        );
        const netSellerAmount = Math.max(
          0,
          grossAmount - commissionFee - taxWithheld,
        );

        // Ghi bản ghi Sổ cái Doanh thu Sàn (PlatformLedger)
        try {
          await firstValueFrom(
            this.platformLedgerModule.recordPlatformLedger({
              processId,
              orderId: order.id,
              shopId: order.shopId,
              grossAmount,
              commissionRate: AppConfiguration.ORDER_SELLER_COMMISSION_PERCENT,
              commissionFee,
              taxRate: AppConfiguration.ORDER_SELLER_TAX_PERCENT,
              taxWithheld,
              netSellerAmount,
            }),
          );
        } catch (ledgerErr) {
          console.error('Lỗi khi ghi nhận Sổ cái Doanh thu Sàn:', ledgerErr);
        }

        const rewardAmount = Math.floor(
          (order.itemTotal * AppConfiguration.ORDER_USER_REWARD_PERCENT) / 100,
        );

        if (rewardAmount > 0) {
          const rewardPayload: AdjustWalletRequest = {
            processId,
            userId: order.userId,
            type: WalletTransactionTypeValues.CREDIT,
            source: WalletTransactionSourceValues.ORDER_REWARD,
            referenceId: order.id,
            amount: rewardAmount,
            description: `Thưởng V-Xu từ đơn hàng ${order.code}`,
          };
          await firstValueFrom(this.walletModule.adjustWallet(rewardPayload));
        }
      }

      try {
        await firstValueFrom(
          this.notificationModule.createNotification({
            processId,
            userId: order.userId,
            type: 'ORDER_UPDATE',
            title: 'Cập nhật đơn hàng',
            description: `Đơn hàng ${order.code} của bạn đã chuyển sang trạng thái ${order.status}`,
          }),
        );
      } catch (err) {
        console.error('Lỗi khi gửi thông báo cập nhật đơn hàng:', err);
      }

      return order;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.OrderNotFound');
      }
      throw error;
    }
  }
}
