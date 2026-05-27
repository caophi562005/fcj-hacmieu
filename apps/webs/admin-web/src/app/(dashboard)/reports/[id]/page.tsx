import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getReportById } from '../../../../lib/admin-utility';
import { ReportDetailForm } from '../ui';

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReportById(id);
  if (!report) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết báo cáo</h1>
          <p className="text-ink-muted text-sm mt-1">Tạo lúc {new Date(report.createdAt).toLocaleString('vi-VN')}</p>
        </div>
        <Link href="/reports" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <div className="max-w-5xl">
        <ReportDetailForm
          report={{
            id: report.id,
            status: report.status,
            action: report.action,
            assigneeAdminId: report.assigneeAdminId,
            title: report.title,
            description: report.description,
            category: report.category,
            targetType: report.targetType,
            targetId: report.targetId,
            reporterId: report.reporterId,
            createdAt: String(report.createdAt),
          }}
        />
      </div>
    </div>
  );
}
