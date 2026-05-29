'use client';

import { useMutation, usePaginatedQuery } from 'convex/react';
import { ArrowLeft, ImagePlus, Search, Send } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Id } from '../api';
import { api } from '../api';
import { InfiniteScrollTrigger } from '../infinite-scroll-trigger';
import { LOAD_SIZE, useInfiniteScroll } from '../use-infinite-scroll';
import type { ChatPeer, ChatViewer } from './types';

type Props = {
  viewer: ChatViewer;
  /** Khi user vào /chat?to=peerId, dùng peer này để getOrCreate conversation. */
  initialPeer?: ChatPeer | null;
};

type ActivePeer = {
  conversationId: Id<'conversations'>;
  peerId: string;
  peerName: string;
  peerAvatar: string;
};

export function ChatLayout({ viewer, initialPeer }: Props) {
  // Thread state độc lập với inbox list: sau khi `getOrCreate` trả về
  // conversationId, lưu kèm snapshot peer luôn để không race với pagination
  // `conversations.list` (list có thể chưa include conversation mới tạo ở lần
  // render đầu tiên — dẫn đến thread rỗng thay vì mở).
  const [active, setActive] = useState<ActivePeer | null>(null);
  const [search, setSearch] = useState('');
  const [mobilePane, setMobilePane] = useState<'list' | 'thread'>('list');

  // Self-chat: chặn upstream để không gọi mutation vô ích + UX rõ ràng.
  const isSelfPeer = Boolean(initialPeer && initialPeer.id === viewer.id);

  const conversations = usePaginatedQuery(
    api.conversations.list,
    { userId: viewer.id },
    { initialNumItems: LOAD_SIZE },
  );

  const getOrCreate = useMutation(api.conversations.getOrCreate);

  // Auto-mở conversation với initialPeer khi vào /chat?to=peerId
  useEffect(() => {
    if (!initialPeer || isSelfPeer) return;
    let cancelled = false;
    (async () => {
      try {
        const id = await getOrCreate({
          userId: viewer.id,
          userName: viewer.name,
          userAvatar: viewer.avatar,
          peerId: initialPeer.id,
          peerName: initialPeer.name,
          peerAvatar: initialPeer.avatar,
        });
        if (cancelled) return;
        setActive({
          conversationId: id,
          peerId: initialPeer.id,
          peerName: initialPeer.name,
          peerAvatar: initialPeer.avatar,
        });
        setMobilePane('thread');
      } catch (err) {
        if (!cancelled) console.error('getOrCreate failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialPeer?.id, viewer.id, isSelfPeer]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = conversations.results ?? [];
  const filtered = useMemo(
    () =>
      search
        ? list.filter((c) =>
            c.peerName.toLowerCase().includes(search.toLowerCase()),
          )
        : list,
    [list, search],
  );

  const inboxScroll = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: LOAD_SIZE,
  });

  return (
    // Fill parent height (`h-full`) — caller (page) quyết định chiều cao cụ thể
    // để khớp header/topbar của từng app. `min-h-0` trên các con flex bên dưới
    // để scroll container shrink đúng (tránh composer bị đẩy xuống khi danh
    // sách tin nhắn dài).
    <div className="grid md:grid-cols-[340px_1fr] h-full min-h-0 bg-white rounded-md shadow-card overflow-hidden border border-slate-200">
      {/* List */}
      <aside
        className={`flex flex-col min-h-0 border-r border-slate-200 bg-white ${
          mobilePane === 'thread' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-lg font-bold mb-3 text-ink">Tin nhắn</h1>
          <div className="flex items-center h-9 rounded bg-surface-muted focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 border border-transparent focus-within:border-primary transition-colors">
            <Search className="w-4 h-4 text-ink-subtle ml-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm cuộc trò chuyện…"
              className="flex-1 bg-transparent border-0 outline-none text-sm px-2"
              aria-label="Tìm trong tin nhắn"
            />
          </div>
        </div>
        <ul className="flex-1 min-h-0 overflow-y-auto">
          {conversations.status === 'LoadingFirstPage' && (
            <li className="p-6 text-center text-sm text-ink-subtle">
              Đang tải…
            </li>
          )}
          {filtered.length === 0 &&
            conversations.status !== 'LoadingFirstPage' && (
              <li className="p-6 text-center text-sm text-ink-subtle">
                Không có cuộc trò chuyện nào.
              </li>
            )}
          {filtered.map((c) => {
            const isActive = c.conversationId === active?.conversationId;
            return (
              <li key={c._id}>
                <button
                  type="button"
                  onClick={() => {
                    setActive({
                      conversationId: c.conversationId,
                      peerId: c.peerId,
                      peerName: c.peerName,
                      peerAvatar: c.peerAvatar,
                    });
                    setMobilePane('thread');
                  }}
                  className={`w-full flex items-center gap-3 p-3 border-l-4 border-b border-slate-100 text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'border-l-primary bg-primary-50/40'
                      : 'border-l-transparent hover:bg-surface-alt'
                  }`}
                >
                  <Avatar src={c.peerAvatar} alt={c.peerName} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-sm truncate text-ink">
                        {c.peerName || c.peerId.slice(0, 8)}
                      </h3>
                      <span className="text-[10px] text-ink-subtle whitespace-nowrap">
                        {formatTime(c.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted truncate mt-0.5">
                      {c.lastMessagePreview ?? 'Chưa có tin nhắn'}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
          <InfiniteScrollTrigger
            canLoadMore={inboxScroll.canLoadMore}
            isLoadingMore={inboxScroll.isLoadingMore}
            onLoadMore={inboxScroll.handleLoadMore}
            ref={inboxScroll.topElementRef}
          />
        </ul>
      </aside>

      {/* Thread */}
      <section
        className={`flex flex-col min-h-0 bg-surface-alt min-w-0 ${
          mobilePane === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {isSelfPeer ? (
          <SelfPeerNotice />
        ) : active ? (
          <ChatThread
            key={active.conversationId}
            viewer={viewer}
            conversationId={active.conversationId}
            peerName={active.peerName || active.peerId.slice(0, 8)}
            peerAvatar={active.peerAvatar}
            onBack={() => setMobilePane('list')}
          />
        ) : (
          <EmptyThread />
        )}
      </section>
    </div>
  );
}

function ChatThread({
  viewer,
  conversationId,
  peerName,
  peerAvatar,
  onBack,
}: {
  viewer: ChatViewer;
  conversationId: Id<'conversations'>;
  peerName: string;
  peerAvatar: string;
  onBack: () => void;
}) {
  const messages = usePaginatedQuery(
    api.messages.list,
    { conversationId, userId: viewer.id },
    { initialNumItems: LOAD_SIZE },
  );

  const sendMessage = useMutation(api.messages.send);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  // Server trả desc (mới → cũ). Đảo lại để hiển thị cũ trên / mới dưới.
  const ordered = useMemo(
    () => [...(messages.results ?? [])].reverse(),
    [messages.results],
  );

  const threadScroll = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: LOAD_SIZE,
  });

  // Auto-scroll xuống cuối khi có tin mới (nhưng không khi load page cũ).
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastMessageId = ordered.at(-1)?._id;
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [conversationId, lastMessageId]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    const isImage =
      /^https?:\/\/.+\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(text);
    setSending(true);
    setDraft('');
    try {
      await sendMessage({
        conversationId,
        userId: viewer.id,
        kind: isImage ? 'image' : 'text',
        body: text,
      });
    } finally {
      setSending(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = ''; // Reset input để có thể chọn lại cùng 1 file nếu cần

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      // Thiết lập kích thước tối đa
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      // Tính toán tỷ lệ thu nhỏ nếu ảnh quá lớn
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round(width * (MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Vẽ ảnh lên canvas với kích thước mới
      ctx.drawImage(img, 0, 0, width, height);

      // Xuất ảnh ra định dạng JPEG với chất lượng 80%
      const base64 = canvas.toDataURL('image/jpeg', 0.8);

      // Convex giới hạn document size là 1MB. Kiểm tra lại lần cuối sau khi nén
      // Độ dài chuỗi Base64 ~1,33 lần kích thước byte thực tế
      if (base64.length > 1000000) {
        alert('Ảnh vẫn quá lớn sau khi nén. Vui lòng chọn ảnh khác nhẹ hơn.');
        return;
      }

      setSending(true);
      try {
        await sendMessage({
          conversationId,
          userId: viewer.id,
          kind: 'image',
          body: base64,
        });
      } finally {
        setSending(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert('Đã xảy ra lỗi khi đọc ảnh. Vui lòng thử lại.');
    };

    img.src = objectUrl;
  };

  return (
    <>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 md:px-5 h-16 border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={onBack}
          className="md:hidden -ml-2 inline-flex items-center justify-center w-9 h-9 rounded text-ink-muted hover:bg-surface-muted cursor-pointer"
          aria-label="Quay lại danh sách"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar src={peerAvatar} alt={peerName} size={40} />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate text-ink">
            {peerName}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollerRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-4 space-y-2"
      >
        <InfiniteScrollTrigger
          canLoadMore={threadScroll.canLoadMore}
          isLoadingMore={threadScroll.isLoadingMore}
          onLoadMore={threadScroll.handleLoadMore}
          ref={threadScroll.topElementRef}
          loadMoreText="Tải tin cũ hơn"
          noMoreText="Đầu cuộc trò chuyện"
        />
        {ordered.map((m) => (
          <MessageBubble
            key={m._id}
            mine={m.senderId === viewer.id}
            kind={m.kind}
            body={m.body}
            createdAt={m._creationTime}
            peerAvatar={peerAvatar}
          />
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={onSubmit}
        className="shrink-0 p-3 md:p-4 bg-white border-t border-slate-200"
      >
        <div className="flex items-center gap-2 bg-surface-muted border border-transparent rounded-md p-1.5 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-ink-muted hover:text-primary hover:bg-surface-alt rounded transition-colors cursor-pointer"
            aria-label="Đính kèm ảnh"
            title="Đính kèm ảnh"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nhập tin nhắn…"
            className="flex-1 bg-transparent border-0 outline-none text-sm py-1.5 px-2"
            aria-label="Nội dung tin nhắn"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="inline-flex items-center gap-1.5 px-4 h-9 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </form>
    </>
  );
}

function MessageBubble({
  mine,
  kind,
  body,
  createdAt,
  peerAvatar,
}: {
  mine: boolean;
  kind: 'text' | 'image';
  body: string;
  createdAt: number;
  peerAvatar: string;
}) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex items-end gap-2 max-w-[80%] ${mine ? 'flex-row-reverse' : ''}`}
      >
        {!mine && <Avatar src={peerAvatar} alt="" size={28} />}
        <div className="flex flex-col gap-1">
          {kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={body}
              alt="Ảnh đính kèm"
              className="max-w-[260px] rounded-lg border border-slate-200 bg-surface-muted object-cover"
            />
          ) : (
            <div
              className={`text-sm leading-relaxed py-2 px-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] whitespace-pre-wrap break-words ${
                mine
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white text-ink border border-slate-200 rounded-tl-sm'
              }`}
            >
              {body}
            </div>
          )}
          <span
            className={`text-[10px] text-ink-subtle ${mine ? 'text-right' : 'text-left'}`}
          >
            {formatTime(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyThread() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-ink-muted px-6 text-center">
      Chọn một cuộc trò chuyện để bắt đầu nhắn tin.
    </div>
  );
}

function SelfPeerNotice() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
      <div className="text-base font-semibold text-ink">
        Đây là shop của bạn
      </div>
      <div className="text-sm text-ink-muted max-w-sm">
        Bạn không thể tự nhắn tin với chính mình. Hãy dùng tài khoản khác để
        trải nghiệm tính năng chat.
      </div>
    </div>
  );
}

function Avatar({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  if (!src) {
    return (
      <div
        className="rounded-full bg-surface-muted border border-slate-200 shrink-0 flex items-center justify-center text-xs text-ink-subtle"
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        {alt?.[0]?.toUpperCase() ?? '?'}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover bg-surface-muted border border-slate-200 shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

function formatTime(ts: number): string {
  if (!ts) return '';
  const now = Date.now();
  const diff = now - ts;
  const d = new Date(ts);
  if (diff < 60_000) return 'Vừa xong';
  if (diff < 3_600_000) return Math.floor(diff / 60_000) + ' phút';
  // Cùng ngày → giờ:phút, khác ngày → DD/MM
  const today = new Date();
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (sameDay) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
