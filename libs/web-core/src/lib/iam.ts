import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  ChangePasswordRequest,
  UserResponse,
} from '@common/interfaces/models/iam';
import type { AxiosInstance } from 'axios';

export async function getCurrentUser(
  api: AxiosInstance,
): Promise<UserResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<UserResponse>>('/iam/user');
    return data?.data ?? null;
  } catch {
    return null;
  }
}

export async function changePassword(
  api: AxiosInstance,
  payload: Omit<ChangePasswordRequest, 'accessToken'>,
): Promise<void> {
  await api.post('/iam/auth/change-password', payload);
}

export async function logout(api: AxiosInstance): Promise<void> {
  await api.post('/iam/auth/logout');
}
