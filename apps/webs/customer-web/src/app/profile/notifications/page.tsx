import { NotificationTypeValues } from '@common/constants/notification.constant';
import { BellOff, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getManyNotifications } from '../../../lib/notifications';
import { NotificationItem } from './NotificationItem';
import { RefreshButton } from './RefreshButton';

const PAGE_SIZE = 10;

const TABS: { key: string; label: string; type?: string }[] = [
  { key: 'all', label: 'Tất cả' },
  {
    key: 'order',
    label: 'Đơn hàng',
    type: NotificationTypeValues.ORDER_UPDATE,
  },
  {
    key: 'promotion',
    label: 'Khuyến mãi',
    type: NotificationTypeValues.PROMOTION,
  },
  { key: 'system', label: 'Hệ thống', type: NotificationTypeValues.OTHER },
];

function formatRelative(value: unknown): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(String(value));
  const ms = d.getTime();
  if (Number.isNaN(ms)) return '';

  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Vừa xong';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return d.toLocaleDateString('vi-VN');
}

type SearchParams = Promise<{ page?: string; tab?: string }>;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const tabKey = sp.tab ?? 'all';
  const activeTab = TABS.find((t) => t.key === tabKey) ?? TABS[0];

  const data = await getManyNotifications({
    page,
    limit: PAGE_SIZE,
    type: activeTab.type,
  });

  const { notifications, totalItems, totalPages } = data;
  const isEmpty = totalItems === 0;

  return (
    <>
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Thông báo</h1>
          <RefreshButton />
          {!isEmpty && (
            <span className="ml-auto text-xs text-ink-subtle">
              {totalItems} thông báo
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
          {TABS.map((t) => {
            const isActive = t.key === activeTab.key;
            return (
              <Link
                key={t.key}
                href={t.key === 'all' ? '?' : `?tab=${t.key}`}
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

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="card divide-y divide-border-subtle overflow-hidden">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                id={n.id}
                type={n.type}
                title={n.title}
                description={n.description}
                link={n.link}
                image={n.image}
                time={formatRelative(n.createdAt)}
                isRead={n.isRead}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              tab={activeTab.key}
            />
          )}
        </>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="card p-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-ink-subtle">
        <BellOff className="w-7 h-7" />
      </div>
      <h2 className="text-base font-semibold mt-4">Chưa có thông báo nào</h2>
      <p className="text-sm text-ink-muted mt-1 max-w-sm">
        Khi có cập nhật về đơn hàng, khuyến mãi hoặc tài khoản, V-Shop sẽ gửi
        thông báo tới đây.
      </p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  tab,
}: {
  page: number;
  totalPages: number;
  tab: string;
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (tab !== 'all') params.set('tab', tab);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : '?';
  };

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-4"
      aria-label="Phân trang thông báo"
    >
      <Link
        href={prevDisabled ? '#' : buildHref(page - 1)}
        aria-disabled={prevDisabled}
        className={`btn-sm btn-outline inline-flex items-center gap-1 ${
          prevDisabled ? 'opacity-40 pointer-events-none' : ''
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Trước
      </Link>
      <span className="text-sm text-ink-muted px-2">
        Trang {page} / {totalPages}
      </span>
      <Link
        href={nextDisabled ? '#' : buildHref(page + 1)}
        aria-disabled={nextDisabled}
        className={`btn-sm btn-outline inline-flex items-center gap-1 ${
          nextDisabled ? 'opacity-40 pointer-events-none' : ''
        }`}
      >
        Sau
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}
