import { DiscountTypeValues } from '@common/constants/promotion.constant';
import type { PromotionRedemptionResponse } from '@common/interfaces/models/promotion';
import { Tag, TicketPercent, TicketX } from 'lucide-react';
import Link from 'next/link';
import { getMyVouchers, type VoucherStatus } from '../../../lib/promotions';
import { ClaimVoucherForm } from './ClaimVoucherForm';

const TABS: { key: string; label: string; status: VoucherStatus | null }[] = [
  { key: 'all', label: 'Tất cả', status: null },
  { key: 'available', label: 'Có thể dùng', status: 'AVAILABLE' },
  { key: 'used', label: 'Đã dùng', status: 'USED' },
  { key: 'cancelled', label: 'Đã huỷ', status: 'CANCELLED' },
];

function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + '₫';
}

function formatDate(value: unknown): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
}

// PERCENT discountValue lưu *100 (xem schema: 100 = 1%, 10000 = 100%).
function buildTitle(v: PromotionRedemptionResponse): string {
  if (v.discountType === DiscountTypeValues.PERCENT) {
    return `Giảm ${(v.discountValue / 100).toFixed(0)}%`;
  }
  return `Giảm ${formatVnd(v.discountValue)}`;
}

function buildDesc(v: PromotionRedemptionResponse): string {
  const parts: string[] = [];
  if (v.minOrderSubtotal > 0) {
    parts.push(`Đơn từ ${formatVnd(v.minOrderSubtotal)}`);
  }
  if (v.maxDiscount && v.discountType === DiscountTypeValues.PERCENT) {
    parts.push(`Tối đa ${formatVnd(v.maxDiscount)}`);
  }
  return parts.length ? parts.join('. ') : 'Áp dụng cho đơn hợp lệ';
}

type VoucherUiStatus = 'available' | 'used' | 'cancelled';

function getUiStatus(v: PromotionRedemptionResponse): VoucherUiStatus {
  if (v.cancelledAt) return 'cancelled';
  if (v.usedAt) return 'used';
  return 'available';
}

export default async function VoucherPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const activeTab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const { redemptions, totalItems } = await getMyVouchers({
    status: activeTab.status,
    limit: 50,
  });

  return (
    <>
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Kho voucher</h1>
            <p className="text-sm text-ink-muted mt-1">
              Nhập mã hoặc thu thập voucher để áp dụng khi mua sắm.
            </p>
          </div>
          <span className="text-sm text-ink-muted shrink-0">
            {totalItems} voucher
          </span>
        </div>

        {/* Form nhập mã + nút "Nhận mã" */}
        <ClaimVoucherForm />

        {/* Tabs trạng thái */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-none">
          {TABS.map((t) => {
            const isActive = t.key === activeTab.key;
            const href = t.key === 'all' ? '?' : `?tab=${t.key}`;
            return (
              <Link
                key={t.key}
                href={href}
                className={`btn-sm rounded-full whitespace-nowrap inline-flex items-center justify-center leading-none ${
                  isActive
                    ? 'bg-primary text-white border border-transparent'
                    : 'btn-outline'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {redemptions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {redemptions.map((v) => (
            <VoucherCard key={v.id} voucher={v} />
          ))}
        </div>
      )}
    </>
  );
}

function VoucherCard({ voucher }: { voucher: PromotionRedemptionResponse }) {
  const status = getUiStatus(voucher);
  const Icon =
    voucher.discountType === DiscountTypeValues.PERCENT ? TicketPercent : Tag;
  const isInactive = status !== 'available';

  return (
    <div
      className={`relative flex bg-white rounded-md shadow-card overflow-hidden border transition-colors ${
        isInactive
          ? 'border-transparent opacity-60'
          : 'border-transparent hover:border-primary/30'
      }`}
    >
      <div
        className={`w-24 shrink-0 text-white flex flex-col items-center justify-center p-3 ${
          status === 'cancelled'
            ? 'bg-gradient-to-br from-ink-muted to-ink-subtle'
            : 'bg-gradient-to-br from-primary to-primary-600'
        }`}
      >
        <Icon className="w-7 h-7" />
        <div className="text-xs mt-1 font-medium uppercase tracking-wider">
          V-Shop
        </div>
      </div>
      <div className="absolute left-[96px] top-0 bottom-0 border-l border-dashed border-border" />
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-base">{buildTitle(voucher)}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="text-xs text-ink-muted line-clamp-2 mt-0.5">
          {buildDesc(voucher)}
        </p>
        <div className="text-[10px] text-ink-subtle mt-1 font-mono">
          MÃ: {voucher.code}
        </div>
        <div className="text-[10px] text-ink-subtle mt-0.5">
          Thu thập: {formatDate(voucher.claimedAt)}
          {status === 'used' && voucher.usedAt
            ? ` · Đã dùng: ${formatDate(voucher.usedAt)}`
            : ''}
        </div>
        {status === 'available' ? (
          <Link
            href="/"
            className="btn-primary btn-sm mt-3 w-full inline-flex items-center justify-center"
          >
            Dùng ngay
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="btn-outline btn-sm mt-3 w-full disabled:opacity-60 cursor-not-allowed"
          >
            {status === 'used' ? 'Đã sử dụng' : 'Đã huỷ'}
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: VoucherUiStatus }) {
  const map: Record<VoucherUiStatus, { label: string; cls: string }> = {
    available: {
      label: 'Có thể dùng',
      cls: 'bg-success/10 text-success',
    },
    used: {
      label: 'Đã dùng',
      cls: 'bg-surface-muted text-ink-muted',
    },
    cancelled: {
      label: 'Đã huỷ',
      cls: 'bg-danger/10 text-danger',
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="card p-8 flex flex-col items-center justify-center text-center">
      <TicketX className="w-12 h-12 text-ink-subtle" />
      <h2 className="font-semibold mt-3">Chưa có voucher nào</h2>
      <p className="text-sm text-ink-muted mt-1">
        Nhập mã ở trên hoặc thu thập voucher từ trang khuyến mãi.
      </p>
    </div>
  );
}
