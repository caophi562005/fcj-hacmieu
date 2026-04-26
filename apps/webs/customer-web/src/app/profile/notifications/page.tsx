import { Bell, Package, TicketPercent, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const NOTIFS: {
  icon: LucideIcon;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
}[] = [
  {
    icon: Package,
    title: 'Đơn hàng đã giao thành công',
    body: 'Đơn #DH202401234 đã được giao. Hãy đánh giá sản phẩm để nhận 200 V-Xu.',
    time: '2 phút trước',
    unread: true,
  },
  {
    icon: TicketPercent,
    title: 'Voucher mới dành cho bạn',
    body: 'Bạn vừa nhận được mã GIAM50K áp dụng cho đơn từ 300.000₫.',
    time: '1 giờ trước',
    unread: true,
  },
  {
    icon: MessageCircle,
    title: 'Phản hồi từ V-Shop',
    body: 'Cửa hàng đã trả lời câu hỏi của bạn về sản phẩm “Tai nghe Bluetooth”.',
    time: 'Hôm qua',
  },
  {
    icon: Bell,
    title: 'Khuyến mãi cuối tuần',
    body: 'Flash Sale 12-12 — Giảm sốc đến 70% các thương hiệu lớn.',
    time: '2 ngày trước',
  },
];

const TABS = ['Tất cả', 'Đơn hàng', 'Khuyến mãi', 'Hệ thống'];

export default function NotificationsPage() {
  return (
    <>
      <div className="card p-5 mb-4">
        <h1 className="text-lg font-semibold">Thông báo</h1>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`btn-sm rounded-full whitespace-nowrap ${
                i === 0 ? 'bg-primary text-white' : 'btn-outline'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card divide-y divide-border-subtle">
        {NOTIFS.map((n, i) => {
          const Icon = n.icon;
          return (
            <div
              key={i}
              className={`flex gap-3 p-4 hover:bg-surface-alt transition-colors cursor-pointer ${
                n.unread ? 'bg-primary-50/30' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <h3 className="font-medium text-sm truncate">{n.title}</h3>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-ink-muted line-clamp-2 mt-0.5">
                  {n.body}
                </p>
                <div className="text-xs text-ink-subtle mt-1">{n.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
