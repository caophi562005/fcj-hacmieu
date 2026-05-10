import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetManyUsersResponse,
  UpdateUserRequest,
  UserResponse,
} from '@common/interfaces/models/iam';
import { createServerApi } from './api';

const EMPTY_USERS: GetManyUsersResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  users: [],
};

export type GetUsersQuery = {
  page?: number;
  limit?: number;
  email?: string;
  username?: string;
  gender?: string;
  status?: string;
  group?: string;
};

export async function getManyUsers(
  query: GetUsersQuery = {},
): Promise<GetManyUsersResponse> {
  const api = await createServerApi();
  const params: Record<string, unknown> = {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
  };

  if (query.email) params.email = query.email;
  if (query.username) params.username = query.username;
  if (query.gender) params.gender = query.gender;
  if (query.status) params.status = query.status;
  if (query.group) params.group = query.group;

  const res = await api.get<ApiResponse<GetManyUsersResponse>>('/iam/user', {
    params,
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });

  if (res.status === 404) {
    return {
      ...EMPTY_USERS,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
  }

  return res.data?.data ?? EMPTY_USERS;
}

export async function getUserById(id: string): Promise<UserResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<UserResponse>>(`/iam/user/${id}`, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });

  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function updateUserById(
  id: string,
  payload: Omit<UpdateUserRequest, 'id' | 'processId'> & {
    group?: string[];
  },
): Promise<UserResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<UserResponse>>(
    `/iam/user/${id}`,
    payload,
  );
  if (!data?.data) throw new Error('Cập nhật user thất bại.');
  return data.data;
}
