import {
  createShopCreditClient,
  type CreatePayoutPayload,
  type SellerCreditTransactionsQuery,
  type SellerPayoutsQuery,
  type UpdatePayoutStatusPayload,
} from '@common/web-core/lib/shop-credit';
import { createServerApi } from './api';

export type {
  CreatePayoutPayload,
  SellerCreditTransactionsQuery,
  SellerPayoutsQuery,
  UpdatePayoutStatusPayload,
};

const sellerCreditClient = createShopCreditClient(createServerApi);

export const {
  getShopCredit,
  getShopCreditTransactions,
  getShopRevenueSummary,
  createShopPayout,
  getShopPayoutById,
  getShopPayouts,
  updateShopPayoutStatus,
  deleteShopPayout,
} = sellerCreditClient;
