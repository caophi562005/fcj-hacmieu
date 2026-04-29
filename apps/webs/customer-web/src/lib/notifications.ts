import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetManyNotificationsResponse,
  ReadNotificationResponse,
} from '@common/interfaces/models/utility';
import { cache } from 'react';
import { createServerApi } from './api';

export type NotificationsQuery = {
  page?: number;
  limit?: number;
  type?: string;
};

const EMPTY: GetManyNotificationsResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  notifications: [],
  unreadCount: 0,
};

// `React.cache` per-request scope: trong 1 request chỉ có 1 user → 1 access token,
// nên không cần đưa accessToken vào cache key. Cache theo (page, limit, type).
const _getManyNotificationsCached = cache(
  async (
    page: number,
    limit: number,
    type: string | null,
  ): Promise<GetManyNotificationsResponse> => {
    const api = await createServerApi();
    // BFF throw NotFoundException (404) khi totalItems === 0 — đó là trạng thái
    // bình thường, không phải lỗi. Cho axios chấp nhận 404 để interceptor không log,
    // rồi kiểm tra status thủ công.
    const res = await api.get<ApiResponse<GetManyNotificationsResponse>>(
      '/utility/notification',
      {
        params: { page, limit, ...(type ? { type } : {}) },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );
    if (res.status === 404) return EMPTY;
    return res.data?.data ?? EMPTY;
  },
);

export function getManyNotifications(
  query: NotificationsQuery = {},
): Promise<GetManyNotificationsResponse> {
  return _getManyNotificationsCached(
    query.page ?? 1,
    query.limit ?? 10,
    query.type ?? null,
  );
}

export async function markNotificationsAsRead(
  ids: string[],
): Promise<ReadNotificationResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<ReadNotificationResponse>>(
    '/utility/notification/read',
    { id: ids },
  );
  return data?.data ?? { count: 0 };
}

export async function deleteNotification(id: string): Promise<void> {
  const api = await createServerApi();
  await api.delete(`/utility/notification/${id}`);
}
