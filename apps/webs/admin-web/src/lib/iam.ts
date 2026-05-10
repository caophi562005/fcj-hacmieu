import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  ChangePasswordRequest,
  UserResponse,
} from '@common/interfaces/models/iam';
import { createServerApi } from './api';

export async function getCurrentUser(): Promise<UserResponse | null> {
  try {
    const api = await createServerApi();
    const { data } = await api.get<ApiResponse<UserResponse>>('/iam/user');
    return data?.data ?? null;
  } catch {
    return null;
  }
}

export async function changePassword(
  payload: Omit<ChangePasswordRequest, 'accessToken'>,
): Promise<void> {
  const api = await createServerApi();
  await api.post('/iam/auth/change-password', payload);
}

export async function logout(): Promise<void> {
  const api = await createServerApi();
  await api.post('/iam/auth/logout');
}
