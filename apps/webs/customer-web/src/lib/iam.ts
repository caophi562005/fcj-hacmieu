import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  UpdateUserRequest,
  UserResponse,
} from '@common/interfaces/models/iam';
import type {
  CreatePresignedUrlRequest,
  CreatePresignedUrlResponse,
} from '@common/interfaces/models/utility';
import {
  changePassword as _changePassword,
  getCurrentUser as _getCurrentUser,
  logout as _logout,
} from '@common/web-core/lib/iam';
import { createServerApi } from './api';

export async function getCurrentUser() {
  const api = await createServerApi();
  return _getCurrentUser(api);
}

export async function changePassword(
  payload: Parameters<typeof _changePassword>[1],
) {
  const api = await createServerApi();
  return _changePassword(api, payload);
}

export async function logout() {
  const api = await createServerApi();
  return _logout(api);
}

export type UpdateCurrentUserPayload = Omit<
  UpdateUserRequest,
  'id' | 'processId'
>;

export async function updateCurrentUser(
  payload: UpdateCurrentUserPayload,
): Promise<UserResponse | null> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<UserResponse>>(
    '/iam/user',
    payload,
  );
  return data?.data ?? null;
}

export async function createPresignedUrl(
  payload: Omit<CreatePresignedUrlRequest, 'processId' | 'userId'>,
): Promise<CreatePresignedUrlResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<CreatePresignedUrlResponse>>(
    '/utility/media/presigned-url',
    payload,
  );
  if (!data?.data) {
    throw new Error('Failed to create presigned URL');
  }
  return data.data;
}
