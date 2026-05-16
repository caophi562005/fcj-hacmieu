'use client';

import { api } from '@common/convex/lib/api';
import { useAction } from 'convex/react';
import { Send } from 'lucide-react';
import { useRef, useState } from 'react';

type Props = {
  threadId: string | null;
  sessionId: string;
};

export function ChatBotInput({ threadId, sessionId }: Props) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useAction(api.bot.messages.send);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !threadId || !sessionId || sending) return;

    setSending(true);
    setDraft('');

    // Focus ngay — không đợi response
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    try {
      await sendMessage({ threadId, sessionId, prompt: text });
    } catch (err) {
      console.error('Send failed:', err);
      setDraft(text);
    } finally {
      setSending(false);
      // Focus lại sau khi sending = false (input không còn disabled)
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 p-3 border-t border-border-subtle bg-white"
    >
      <div className="flex items-center gap-2 bg-surface-muted rounded-lg px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary border border-transparent transition-colors">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={sending ? 'Đang gửi...' : 'Nhập câu hỏi...'}
          disabled={!threadId}
          className="flex-1 bg-transparent border-0 outline-none text-sm py-2.5"
          aria-label="Nhập tin nhắn"
          autoFocus
        />
        <button
          type="submit"
          disabled={!draft.trim() || !threadId || sending}
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-primary-600 transition-colors"
          aria-label="Gửi"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
