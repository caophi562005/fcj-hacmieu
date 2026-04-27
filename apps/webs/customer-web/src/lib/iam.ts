import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  ChangePasswordRequest,
  UpdateUserRequest,
  UserResponse,
} from '@common/interfaces/models/iam';
import { createApi, type CreateApiOptions } from './api';

export async function getCurrentUser(
  options: CreateApiOptions,
): Promise<UserResponse | null> {
  try {
    const api = createApi(options);
    const { data } = await api.get<ApiResponse<UserResponse>>('/iam/user');
    return data?.data ?? null;
  } catch {
    return null;
  }
}

export type UpdateCurrentUserPayload = Omit<
  UpdateUserRequest,
  'id' | 'processId'
>;

export async function updateCurrentUser(
  options: CreateApiOptions,
  payload: UpdateCurrentUserPayload,
): Promise<UserResponse | null> {
  const api = createApi(options);
  const { data } = await api.put<ApiResponse<UserResponse>>(
    '/iam/user',
    payload,
  );
  return data?.data ?? null;
}

export async function changePassword(
  options: CreateApiOptions,
  payload: Omit<ChangePasswordRequest, 'accessToken'>,
): Promise<void> {
  const api = createApi(options);
  await api.post('/iam/auth/change-password', payload);
}
