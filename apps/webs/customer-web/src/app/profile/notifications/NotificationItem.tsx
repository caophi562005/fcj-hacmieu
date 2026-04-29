'use client';

import { NotificationTypeValues } from '@common/constants/notification.constant';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Check,
  Coins,
  Loader2,
  Package,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import { useTransition } from 'react';
import { deleteNotificationAction, markAsReadAction } from './actions';

// Server Components không thể pass component (Lucide icon) sang Client Component
// → truyền `type` string rồi map sang icon trong client.
const ICON_BY_TYPE: Record<string, LucideIcon> = {
  [NotificationTypeValues.ORDER_UPDATE]: Package,
  [NotificationTypeValues.PROMOTION]: TicketPercent,
  [NotificationTypeValues.WALLET_UPDATE]: Coins,
  [NotificationTypeValues.OTHER]: Bell,
};

type Props = {
  id: string;
  type: string;
  title: string;
  description: string;
  link?: string;
  image?: string;
  time: string;
  isRead: boolean;
};

export function NotificationItem({
  id,
  type,
  title,
  description,
  link,
  image,
  time,
  isRead,
}: Props) {
  const Icon = ICON_BY_TYPE[type] ?? Bell;
  const [pending, startTransition] = useTransition();

  const handleMarkRead = () => {
    startTransition(async () => {
      await markAsReadAction(id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteNotificationAction(id);
    });
  };

  // Item chưa đọc: nền đậm hơn (`bg-primary-50/60`) + viền trái màu primary.
  const containerClass = isRead
    ? 'bg-white hover:bg-surface-alt'
    : 'bg-primary-50/60 hover:bg-primary-50 border-l-4 border-primary';

  const Wrapper = link
    ? ({ children }: { children: React.ReactNode }) => (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0"
        >
          {children}
        </a>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="flex-1 min-w-0">{children}</div>
      );

  return (
    <div
      className={`flex gap-3 p-4 transition-colors ${containerClass} ${
        pending ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-primary-50 text-primary flex items-center justify-center shrink-0 overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      <Wrapper>
        <div className="flex items-start gap-2">
          <h3
            className={`text-sm truncate ${
              isRead ? 'font-medium text-ink-muted' : 'font-semibold text-ink'
            }`}
          >
            {title}
          </h3>
          {!isRead && (
            <span
              className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"
              aria-label="Chưa đọc"
            />
          )}
        </div>
        <p className="text-sm text-ink-muted line-clamp-2 mt-0.5">
          {description}
        </p>
        <div className="text-xs text-ink-subtle mt-1">{time}</div>
      </Wrapper>

      <div className="flex flex-col gap-1 shrink-0">
        {!isRead && (
          <button
            type="button"
            onClick={handleMarkRead}
            disabled={pending}
            className="w-8 h-8 inline-flex items-center justify-center rounded text-ink-muted hover:text-success hover:bg-surface-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
            aria-label="Đánh dấu đã đọc"
            title="Đánh dấu đã đọc"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="w-8 h-8 inline-flex items-center justify-center rounded text-ink-muted hover:text-danger hover:bg-surface-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
          aria-label="Xoá thông báo"
          title="Xoá thông báo"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
