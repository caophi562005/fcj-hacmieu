import type {
  GetManyReportsResponse,
  ReportResponse,
  UpdateReportRequest,
} from '@common/interfaces/models/utility';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import { createServerApi } from './api';

export async function getManyReports(query: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
} = {}): Promise<GetManyReportsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyReportsResponse>>('/utility/report', {
    params: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.status ? { status: query.status } : {}),
    },
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });

  if (res.status === 404) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      reports: [],
    };
  }

  const raw = res.data?.data as Partial<GetManyReportsResponse> | undefined;
  if (!raw || typeof raw !== 'object') {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      reports: [],
    };
  }

  return {
    page: raw.page ?? (query.page ?? 1),
    limit: raw.limit ?? (query.limit ?? 10),
    totalItems: raw.totalItems ?? 0,
    totalPages: raw.totalPages ?? 0,
    reports: Array.isArray(raw.reports) ? raw.reports : [],
  };
}

export async function getReportById(id: string): Promise<ReportResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<ReportResponse>>(`/utility/report/${id}`, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });
  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function updateReport(payload: Pick<UpdateReportRequest, 'id' | 'status' | 'action' | 'assigneeAdminId'>): Promise<ReportResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<ReportResponse>>(
    `/utility/report/${payload.id}`,
    {
      status: payload.status,
      action: payload.action,
      assigneeAdminId: payload.assigneeAdminId,
    },
  );
  if (!data?.data) throw new Error('Cập nhật báo cáo thất bại.');
  return data.data;
}

export async function deleteReport(id: string): Promise<ReportResponse> {
  const api = await createServerApi();
  const { data } = await api.delete<ApiResponse<ReportResponse>>(`/utility/report/${id}`);
  if (!data?.data) throw new Error('Xoá báo cáo thất bại.');
  return data.data;
}
