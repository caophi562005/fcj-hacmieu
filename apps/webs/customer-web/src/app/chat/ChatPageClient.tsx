'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import {
  Search,
  Phone,
  Send,
  Plus,
  Smartphone,
  ArrowLeft,
} from 'lucide-react';
import type { Conversation, ChatMessage } from '../../components/chatData';

export function ChatPageClient({
  conversations,
  initialId,
}: {
  conversations: Conversation[];
  initialId: string;
}) {
  const [activeId, setActiveId] = useState(initialId);
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [extraMsgs, setExtraMsgs] = useState<Record<string, ChatMessage[]>>({});
  const [mobilePane, setMobilePane] = useState<'list' | 'chat'>('list');

  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.shopName.toLowerCase().includes(query.toLowerCase()),
      ),
    [conversations, query],
  );

  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0];
  const messages: ChatMessage[] = [
    ...active.messages,
    ...(extraMsgs[active.id] ?? []),
  ];

  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, extraMsgs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = (drafts[active.id] ?? '').trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;
    setExtraMsgs((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] ?? []),
        { id: `local-${Date.now()}`, from: 'me', text, time },
      ],
    }));
    setDrafts((prev) => ({ ...prev, [active.id]: '' }));
  };

  return (
    <div
      className="grid md:grid-cols-[340px_1fr] bg-white rounded-md shadow-card overflow-hidden border border-border-subtle"
      style={{ height: 'calc(100vh - 7.5rem)' }}
    >
      {/* Conversation list */}
      <aside
        className={`flex flex-col border-r border-border-subtle bg-white ${
          mobilePane === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-border-subtle">
          <h1 className="text-lg font-bold mb-3">Tin nhắn</h1>
          <div className="flex items-center h-9 rounded bg-surface-muted focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 border border-transparent focus-within:border-primary transition-colors">
            <Search className="w-4 h-4 text-ink-subtle ml-2.5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm cuộc trò chuyện…"
              className="flex-1 bg-transparent border-0 outline-none text-sm px-2"
              aria-label="Tìm trong tin nhắn"
            />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm text-ink-subtle">
              Không có cuộc trò chuyện nào.
            </li>
          )}
          {filtered.map((c) => {
            const isActive = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(c.id);
                    setMobilePane('chat');
                  }}
                  className={`w-full flex items-center gap-3 p-3 border-l-4 border-b border-border-subtle text-left transition-colors ${
                    isActive
                      ? 'border-l-primary bg-primary-50/40'
                      : 'border-l-transparent hover:bg-surface-alt'
                  }`}
                >
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.shopAvatar}
                      alt={c.shopName}
                      className="w-12 h-12 rounded-full object-cover bg-surface-muted border border-border-subtle"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        c.online ? 'bg-success' : 'bg-ink-subtle'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-sm truncate">
                        {c.shopName}
                      </h3>
                      <span className="text-[10px] text-ink-subtle whitespace-nowrap">
                        {c.lastTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${
                          c.unread ? 'text-ink font-medium' : 'text-ink-muted'
                        }`}
                      >
                        {c.lastMessage}
                      </p>
                      {c.unread && (
                        <span className="bg-primary text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Conversation pane */}
      <section
        className={`flex flex-col bg-surface-alt min-w-0 ${
          mobilePane === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 md:px-5 h-16 border-b border-border-subtle bg-white">
          <button
            type="button"
            onClick={() => setMobilePane('list')}
            className="md:hidden -ml-2 inline-flex items-center justify-center w-9 h-9 rounded text-ink-muted hover:bg-surface-muted"
            aria-label="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.shopAvatar}
              alt={active.shopName}
              className="w-10 h-10 rounded-full object-cover border border-border-subtle bg-surface-muted"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                active.online ? 'bg-success' : 'bg-ink-subtle'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">
              {active.shopName}
            </h2>
            <p className="text-xs text-ink-muted flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  active.online ? 'bg-success' : 'bg-ink-subtle'
                }`}
              />
              {active.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center w-9 h-9 rounded text-ink-muted hover:text-primary hover:bg-surface-muted transition-colors"
            aria-label="Gọi điện"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3"
        >
          <div className="text-center text-[11px] text-ink-subtle">
            Hôm nay
          </div>
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              shopAvatar={active.shopAvatar}
            />
          ))}
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSend}
          className="p-3 md:p-4 bg-white border-t border-border-subtle"
        >
          <div className="flex items-center gap-1 bg-surface-muted border border-transparent rounded-md px-1 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
            <button
              type="button"
              className="p-2 text-ink-muted hover:text-primary rounded transition-colors"
              aria-label="Đính kèm"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 text-ink-muted hover:text-primary rounded transition-colors"
              aria-label="Sản phẩm"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <input
              value={drafts[active.id] ?? ''}
              onChange={(e) =>
                setDrafts((p) => ({ ...p, [active.id]: e.target.value }))
              }
              placeholder="Nhập tin nhắn…"
              className="flex-1 bg-transparent border-0 outline-none text-sm py-2 px-1"
              aria-label="Nội dung tin nhắn"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 h-9 bg-primary text-white text-sm font-medium rounded hover:bg-primary-600 transition-colors disabled:opacity-50"
              disabled={!(drafts[active.id] ?? '').trim()}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function MessageBubble({
  message,
  shopAvatar,
}: {
  message: ChatMessage;
  shopAvatar: string;
}) {
  const mine = message.from === 'me';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end gap-2 max-w-[80%] ${mine ? 'flex-row-reverse' : ''}`}>
        {!mine && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shopAvatar}
            alt=""
            className="w-7 h-7 rounded-full object-cover bg-surface-muted shrink-0"
          />
        )}
        <div className="flex flex-col gap-1">
          <div
            className={`text-sm leading-relaxed py-2 px-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
              mine
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-white text-ink border border-border-subtle rounded-tl-sm'
            }`}
          >
            {message.text}
          </div>
          <span
            className={`text-[10px] text-ink-subtle ${
              mine ? 'text-right' : 'text-left'
            }`}
          >
            {message.time}
          </span>
        </div>
      </div>
    </div>
  );
}
