import type { MerchantResponse } from '@common/interfaces/models/shop';
import {
  BadgeCheck,
  Building2,
  CircleHelp,
  ShieldAlert,
  ShieldX,
  User,
  type LucideIcon,
} from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  INDIVIDUAL: 'Cá nhân',
  BUSINESS: 'Doanh nghiệp',
};

const APPROVAL_LABEL: Record<string, string> = {
  PENDING: 'Đang chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  SUSPENDED: 'Tạm khoá',
};

const APPROVAL_BADGE: Record<string, { className: string; icon: LucideIcon }> =
  {
    PENDING: {
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: CircleHelp,
    },
    APPROVED: {
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: BadgeCheck,
    },
    REJECTED: {
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: ShieldX,
    },
    SUSPENDED: {
      className: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: ShieldAlert,
    },
  };

export function MerchantInfo({ merchant }: { merchant: MerchantResponse }) {
  const badge =
    APPROVAL_BADGE[merchant.approvalStatus] ?? APPROVAL_BADGE.PENDING;
  const BadgeIcon = badge.icon;
  const TypeIcon = merchant.type === 'BUSINESS' ? Building2 : User;

  return (
    <section className="card p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Thông tin đăng ký bán hàng
          </h2>
          <p className="text-sm text-ink-muted mt-0.5">
            Thông tin pháp lý của tài khoản bán hàng. Liên hệ hỗ trợ nếu cần
            chỉnh sửa.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${badge.className}`}
        >
          <BadgeIcon className="w-3.5 h-3.5" />
          {APPROVAL_LABEL[merchant.approvalStatus] ?? merchant.approvalStatus}
        </span>
      </div>

      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
        <Field
          label="Loại hình"
          value={
            <span className="inline-flex items-center gap-1.5">
              <TypeIcon className="w-4 h-4 text-ink-muted" />
              {TYPE_LABEL[merchant.type] ?? merchant.type}
            </span>
          }
        />
        <Field label="Tên pháp lý" value={merchant.legalName} />
        <Field
          label="Mã số thuế"
          value={merchant.taxCode || <Empty />}
          mono={Boolean(merchant.taxCode)}
        />
        <Field
          label="Quyền bán hàng"
          value={
            merchant.canSell ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <BadgeCheck className="w-4 h-4" /> Đang được phép bán
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-700">
                <ShieldX className="w-4 h-4" /> Tạm thời chưa được bán
              </span>
            )
          }
        />
      </dl>
    </section>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="text-xs font-medium text-ink-subtle uppercase tracking-wide">
        {label}
      </dt>
      <dd className={`text-sm text-ink break-words ${mono ? 'font-mono' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function Empty() {
  return <span className="text-ink-subtle italic">—</span>;
}
