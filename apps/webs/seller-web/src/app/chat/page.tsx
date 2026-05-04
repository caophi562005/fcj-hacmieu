import {
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  MoreVertical,
  Package,
  Phone,
  Plus,
  Search,
  Send,
  ShoppingBag,
  Tag,
  TicketPercent,
} from 'lucide-react';
import {
  formatCurrency,
  formatTime,
  mockConversations,
  type Conversation,
} from '../../lib/mockData';

export const metadata = { title: 'Quản lý Tin nhắn — V-Shop Seller' };

export default function ChatPage() {
  const active = mockConversations[0];

  return (
    // Vì layout wrap bằng p-6 nên trừ đi padding đó + topbar
    <div className="-m-6 h-[calc(100vh-theme(spacing.topbar))] flex bg-background">
      {/* Left: list */}
      <aside className="w-[340px] shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
            <input
              type="search"
              placeholder="Tìm kiếm khách hàng..."
              className="input pl-9 bg-surface-alt border-transparent"
              aria-label="Tìm kiếm hội thoại"
            />
          </div>
        </div>
        <div className="flex px-4 pt-2 border-b border-slate-100">
          <button
            type="button"
            className="flex-1 pb-3 text-center border-b-2 border-primary text-primary text-sm font-semibold"
          >
            Tất cả
          </button>
          <button
            type="button"
            className="flex-1 pb-3 text-center border-b-2 border-transparent text-ink-muted hover:text-ink text-sm font-semibold"
          >
            Chưa đọc
            <span className="bg-danger text-white rounded-full px-1.5 py-0.5 text-[10px] ml-1">
              3
            </span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((c, i) => (
            <ConvListItem key={c.id} conv={c} active={i === 0} />
          ))}
        </div>
      </aside>

      {/* Middle: chat */}
      <section className="flex-1 flex flex-col min-w-0 bg-white">
        <ChatHeader conv={active} />
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-surface-alt">
          <div className="flex justify-center">
            <span className="bg-white text-ink-muted text-[11px] font-semibold px-3 py-1 rounded-full shadow-card">
              Hôm nay
            </span>
          </div>
          {active.messages.map((m) => (
            <MessageBubble key={m.id} message={m} avatar={active.customerAvatar} />
          ))}
        </div>
        <ChatInput />
      </section>

      {/* Right: customer info */}
      <aside className="w-[320px] shrink-0 bg-surface-alt border-l border-slate-200 overflow-y-auto hidden lg:block">
        <div className="p-6 flex flex-col gap-6">
          <CustomerCard conv={active} />
          <TagsCard tags={active.tags} />
          <RecentOrdersCard conv={active} />
        </div>
      </aside>
    </div>
  );
}

function ConvListItem({ conv, active }: { conv: Conversation; active: boolean }) {
  return (
    <button
      type="button"
      className={`w-full p-4 border-b border-slate-100 text-left flex gap-3 transition-colors relative ${
        active ? 'bg-surface-alt' : 'hover:bg-surface-alt'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-0 w-1 h-full bg-primary" aria-hidden />
      )}
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={conv.customerAvatar}
          alt=""
          className="w-12 h-12 rounded-full object-cover bg-surface-muted"
        />
        {conv.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="text-sm font-semibold text-ink truncate">
            {conv.customerName}
          </h3>
          <span className="text-xs text-ink-subtle whitespace-nowrap">
            {formatTime(conv.lastAt)}
          </span>
        </div>
        <p className="text-sm text-ink-muted truncate">{conv.lastMessage}</p>
      </div>
      {conv.unread > 0 && (
        <div className="w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 self-center">
          {conv.unread}
        </div>
      )}
    </button>
  );
}

function ChatHeader({ conv }: { conv: Conversation }) {
  return (
    <div className="h-topbar border-b border-slate-100 flex items-center justify-between px-6 bg-white">
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={conv.customerAvatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover bg-surface-muted"
          />
          {conv.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink leading-tight">
            {conv.customerName}
          </h2>
          {conv.online && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-ink-muted">Đang hoạt động</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="w-10 h-10 rounded-full hover:bg-surface-muted text-ink-muted flex items-center justify-center transition-colors"
          aria-label="Gọi điện"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded-full hover:bg-surface-muted text-ink-muted flex items-center justify-center transition-colors"
          aria-label="Thêm"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  avatar,
}: {
  message: Conversation['messages'][number];
  avatar: string;
}) {
  const isShop = message.from === 'shop';
  return (
    <div className={`flex gap-3 max-w-[80%] ${isShop ? 'self-end flex-row-reverse' : ''}`}>
      {!isShop && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatar}
          alt=""
          className="w-8 h-8 rounded-full object-cover self-end mb-1 shrink-0"
        />
      )}
      <div className={`flex flex-col gap-1 ${isShop ? 'items-end' : 'items-start'}`}>
        {message.text && (
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-card text-sm ${
              isShop
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-white text-ink rounded-bl-sm'
            }`}
          >
            {message.text}
          </div>
        )}
        {message.productRef && (
          <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-card flex gap-3 w-[260px] border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.productRef.image}
              alt=""
              className="w-16 h-16 rounded bg-surface-muted object-cover shrink-0"
            />
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs font-semibold text-ink line-clamp-2 mb-1">
                {message.productRef.name}
              </span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(message.productRef.price)}
              </span>
            </div>
          </div>
        )}
        <span className="text-[10px] text-ink-subtle mx-1">{formatTime(message.at)}</span>
      </div>
    </div>
  );
}

function ChatInput() {
  return (
    <div className="p-4 bg-white border-t border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <ToolbarButton icon={ImageIcon} label="Gửi ảnh/video" />
        <ToolbarButton icon={Package} label="Gửi sản phẩm" />
        <ToolbarButton icon={TicketPercent} label="Gửi voucher" />
        <ToolbarButton icon={MessageSquare} label="Mẫu trả lời nhanh" />
      </div>
      <div className="flex items-end gap-2 bg-surface-alt border border-slate-200 rounded-md p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
        <textarea
          rows={1}
          placeholder="Nhập tin nhắn..."
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none max-h-32 min-h-[40px] text-sm text-ink px-2 py-2"
        />
        <button
          type="button"
          className="bg-primary text-white w-10 h-10 rounded-md flex items-center justify-center shrink-0 hover:bg-primary-600 transition-colors shadow-sm"
          aria-label="Gửi"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="p-1.5 rounded text-ink-muted hover:text-primary hover:bg-surface-muted transition-colors"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function CustomerCard({ conv }: { conv: Conversation }) {
  return (
    <div className="card p-5 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full p-1 border-2 border-primary mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={conv.customerAvatar}
          alt=""
          className="w-full h-full rounded-full object-cover bg-surface-muted"
        />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">{conv.customerName}</h3>
      <span className="inline-flex items-center gap-1 bg-surface-muted px-2 py-1 rounded text-ink-muted text-xs font-semibold mb-4">
        <MapPin className="w-3 h-3" />
        Hà Nội
      </span>
      <div className="w-full grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-primary">
            {conv.stats.completedOrders}
          </span>
          <span className="text-[11px] text-ink-muted uppercase tracking-wider">
            Đơn thành công
          </span>
        </div>
        <div className="flex flex-col items-center border-l border-slate-100">
          <span className="text-lg font-bold text-ink">
            {(conv.stats.totalSpent / 1_000_000).toFixed(1)}M
          </span>
          <span className="text-[11px] text-ink-muted uppercase tracking-wider">
            Tổng chi tiêu
          </span>
        </div>
      </div>
    </div>
  );
}

function TagsCard({ tags }: { tags: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
        <Tag className="w-4 h-4 text-ink-muted" />
        Phân loại khách hàng
      </h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span
            key={t}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              i === 0
                ? 'bg-blue-50 text-blue-700'
                : 'bg-surface-muted text-ink'
            }`}
          >
            {t}
          </span>
        ))}
        <button
          type="button"
          className="px-3 py-1 border border-dashed border-slate-300 text-ink-muted hover:text-primary hover:border-primary rounded-full text-xs flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Thêm
        </button>
      </div>
    </div>
  );
}

function RecentOrdersCard({ conv }: { conv: Conversation }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-ink-muted" />
          Đơn hàng gần đây
        </h4>
        <button className="text-xs text-primary font-semibold hover:underline">
          Xem tất cả
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {conv.recentOrders.length === 0 && (
          <p className="text-xs text-ink-subtle italic">Chưa có đơn hàng.</p>
        )}
        {conv.recentOrders.map((o) => (
          <div
            key={o.code}
            className="card p-3 hover:shadow-floating transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
              <span className="text-[11px] text-ink-muted font-semibold">
                #{o.code}
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                {o.status}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded bg-surface-muted shrink-0 flex items-center justify-center">
                <Package className="w-5 h-5 text-ink-subtle" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink truncate">{o.productName}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-ink-muted">x{o.quantity}</span>
                  <span className="text-sm font-semibold text-ink">
                    {formatCurrency(o.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
