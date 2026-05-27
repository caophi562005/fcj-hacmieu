'use server';

import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import { createServerApi } from './api';

export type ReportTargetType = 'USER' | 'SELLER' | 'PRODUCT' | 'ORDER' | 'MESSAGE' | 'REVIEW';
export type ReportCategory = 'SCAM' | 'FRAUD' | 'FAKE' | 'HARASSMENT' | 'SPAM' | 'OTHER';

export type CreateReportInput = {
  targetType: ReportTargetType;
  targetId: string;
  category: ReportCategory;
  title: string;
  description: string;
};

export type CreateReportResult =
  | { ok: true }
  | { ok: false; message: string };

// Server Action: Gửi báo cáo
export async function createReportAction(
  input: CreateReportInput,
): Promise<CreateReportResult> {
  try {
    const api = await createServerApi();
    // Giả định BFF route là /utility/report. Nếu sai, cần cập nhật lại tại BFF
    await api.post<ApiResponse<any>>('/utility/report', input);
    return { ok: true };
  } catch (e: unknown) {
    const err = e as {
      response?: { data?: { message?: string }; status?: number };
      message?: string;
    };
    if (err?.response?.status === 401) {
      return { ok: false, message: 'Bạn cần đăng nhập để thực hiện chức năng này' };
    }
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Không thể gửi báo cáo, vui lòng thử lại sau';
    return { ok: false, message };
  }
}
