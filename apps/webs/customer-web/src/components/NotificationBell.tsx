'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
  initialUnreadCount: number;
  href: string;
};

// SSE wire payload: `data: {"type":"notification","data":{"userId":"...","unreadCount":12}}`
// Nest đẩy `MessageEvent` thành 1 dòng `data:` JSON (không emit `event:` line),
// nên ở browser fires event 'message' và JSON có cấu trúc {type, data}.
type SseEnvelope = {
  type: string;
  data: {
    userId: string;
    unreadCount: number;
  };
};

export function NotificationBell({ initialUnreadCount, href }: Props) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  // Khi server re-render Header (sau revalidate: mark-as-read, delete...),
  // `initialUnreadCount` mới được truyền vào nhưng `useState` chỉ chạy lúc
  // mount → state cũ giữ nguyên. Sync lại để bell phản ánh đúng count.
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    const es = new EventSource('/api/notifications/sse');

    const onMessage = (e: MessageEvent) => {
      try {
        const envelope: SseEnvelope = JSON.parse(e.data);
        const count = envelope?.data?.unreadCount;
        if (typeof count === 'number') {
          setUnreadCount(count);
        }
      } catch {
        // ignore malformed events
      }
    };

    es.addEventListener('message', onMessage as EventListener);
    es.onerror = () => {
      // Browser tự reconnect; chỉ log để debug.
      // console.warn('[notifications SSE] error');
    };

    return () => {
      es.removeEventListener('message', onMessage as EventListener);
      es.close();
    };
  }, []);

  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={href}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded text-ink-muted hover:text-primary hover:bg-surface-muted transition-colors"
      aria-label={
        hasUnread ? `Thông báo (${unreadCount} chưa đọc)` : 'Thông báo'
      }
    >
      <Bell className="w-5 h-5" />
      {hasUnread && (
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
