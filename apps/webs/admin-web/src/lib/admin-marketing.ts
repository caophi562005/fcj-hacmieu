import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetManyMarketingCampaignsResponse,
  MarketingCampaignResponse,
  MarketingOperationResponse,
} from '@common/interfaces/models/promotion';
import { createServerApi } from './api';

export async function getMarketingCampaigns(
  query: {
    page?: number;
    limit?: number;
    status?: string;
  } = {},
): Promise<GetManyMarketingCampaignsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyMarketingCampaignsResponse>>(
    '/promotion/marketing',
    {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        ...(query.status ? { status: query.status } : {}),
      },
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 404,
    },
  );

  const data = res.status === 404 ? undefined : res.data?.data;
  return {
    page: Number(data?.page) || query.page || 1,
    limit: Number(data?.limit) || query.limit || 10,
    totalItems: Number(data?.totalItems) || 0,
    totalPages: Number(data?.totalPages) || 0,
    campaigns: Array.isArray(data?.campaigns) ? data.campaigns : [],
  };
}

export async function createMarketingCampaign(payload: {
  name: string;
  promotionId: string;
  subject: string;
  preheader?: string;
  introContent: string;
  scheduledAt?: string;
}): Promise<MarketingCampaignResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<MarketingCampaignResponse>>(
    '/promotion/marketing',
    payload,
  );
  if (!data.data) throw new Error('Không thể tạo chiến dịch.');
  return data.data;
}

export async function dispatchMarketingCampaign(
  id: string,
): Promise<MarketingOperationResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<MarketingOperationResponse>>(
    `/promotion/marketing/${id}/dispatch`,
  );
  if (!data.data) throw new Error('Không thể gửi chiến dịch.');
  return data.data;
}

export async function scanMarketing(): Promise<MarketingOperationResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<MarketingOperationResponse>>(
    '/promotion/marketing/scan/run',
  );
  if (!data.data) throw new Error('Không thể quét lịch marketing.');
  return data.data;
}
