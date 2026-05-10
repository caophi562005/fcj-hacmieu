'use server';

import { revalidatePath } from 'next/cache';
import { deleteReport, updateReport } from '../../lib/admin-utility';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })?.response
    ?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Thao tác báo cáo thất bại.';
}

export async function updateReportAction(input: {
  id: string;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
  action?: string;
  assigneeAdminId?: string;
}) {
  try {
    await updateReport({
      ...input,
      action: input.action || undefined,
      assigneeAdminId: input.assigneeAdminId || undefined,
    });
    revalidatePath('/reports');
    revalidatePath(`/reports/${input.id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function deleteReportAction(id: string) {
  try {
    await deleteReport(id);
    revalidatePath('/reports');
    revalidatePath(`/reports/${id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
