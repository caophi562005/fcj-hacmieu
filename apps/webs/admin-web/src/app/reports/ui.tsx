'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { deleteReportAction, updateReportAction } from './actions';

const REPORT_STATUS_OPTIONS = ['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED'] as const;

const REPORT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  REVIEWING: 'Đang xem xét',
  RESOLVED: 'Đã xử lý',
  REJECTED: 'Đã từ chối',
};

export function ReportDetailForm({
  report,
}: {
  report: {
    id: string;
    status: string;
    action?: string;
    assigneeAdminId?: string;
    title: string;
    description: string;
    category: string;
    targetType: string;
    targetId: string;
    reporterId: string;
    createdAt: string;
  };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="card p-6 md:p-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const status = String(formData.get('status') || 'PENDING') as
            | 'PENDING'
            | 'REVIEWING'
            | 'RESOLVED'
            | 'REJECTED';

          const res = await updateReportAction({
            id: report.id,
            status,
            action: String(formData.get('action') || ''),
            assigneeAdminId: String(formData.get('assigneeAdminId') || ''),
          });

          if (res.ok) toast.success('Cập nhật báo cáo thành công.');
          else toast.error(res.message || 'Cập nhật báo cáo thất bại.');
        });
      }}
    >
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Thông tin báo cáo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={report.id} disabled className="input opacity-70" />
          <input value={report.reporterId} disabled className="input opacity-70" />
          <input value={report.title} disabled className="input opacity-70" />
          <input value={report.category} disabled className="input opacity-70" />
          <input value={report.targetType} disabled className="input opacity-70" />
          <input value={report.targetId} disabled className="input opacity-70" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Nội dung xử lý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="status" defaultValue={report.status} className="input cursor-pointer">
            {REPORT_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {REPORT_STATUS_LABEL[value]}
              </option>
            ))}
          </select>
          <input
            name="assigneeAdminId"
            defaultValue={report.assigneeAdminId || ''}
            className="input"
            placeholder="Assignee admin ID"
          />
        </div>

        <textarea
          value={report.description}
          disabled
          className="input min-h-24 opacity-70"
        />

        <textarea
          name="action"
          defaultValue={report.action || ''}
          className="input min-h-24"
          placeholder="Kết luận / hành động xử lý"
        />
      </section>

      <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
        <button type="submit" className="btn-primary btn-md" disabled={isPending}>
          {isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
        </button>
        <button
          type="button"
          className="btn-outline btn-md"
          disabled={isPending}
          onClick={() => {
            if (!confirm('Bạn chắc chắn muốn xoá báo cáo này?')) return;
            startTransition(async () => {
              const res = await deleteReportAction(report.id);
              if (res.ok) {
                toast.success('Đã xoá báo cáo.');
                window.location.href = '/reports';
              } else {
                toast.error(res.message || 'Xoá báo cáo thất bại.');
              }
            });
          }}
        >
          Xóa báo cáo
        </button>
      </div>
    </form>
  );
}
