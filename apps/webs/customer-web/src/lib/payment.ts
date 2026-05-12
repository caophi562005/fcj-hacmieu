import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type { GetPaymentResponse } from '@common/interfaces/models/payment';
import { createServerApi } from './api';

export async function getMyPaymentById(paymentId: string) {
  const api = await createServerApi();
  const { data } = await api.get<ApiResponse<GetPaymentResponse>>(
    `/payment/payment/${paymentId}`,
  );
  return data.data;
}
