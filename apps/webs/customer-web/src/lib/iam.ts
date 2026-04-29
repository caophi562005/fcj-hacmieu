import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  ChangePasswordRequest,
  UpdateUserRequest,
  UserResponse,
} from '@common/interfaces/models/iam';
import type {
  CreatePresignedUrlRequest,
  CreatePresignedUrlResponse,
} from '@common/interfaces/models/utility';
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

export async function changePassword(
  payload: Omit<ChangePasswordRequest, 'accessToken'>,
): Promise<void> {
  const api = await createServerApi();
  await api.post('/iam/auth/change-password', payload);
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
