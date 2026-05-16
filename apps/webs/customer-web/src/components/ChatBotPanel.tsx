'use client';

import { api } from '@common/convex/lib/api';
import { useMutation, useQuery } from 'convex/react';
import { Bot, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChatBotInput } from './ChatBotInput';
import { ChatBotMessages } from './ChatBotMessages';

const SESSION_KEY = 'vshop_bot_session';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

type Props = { onClose: () => void };

export function ChatBotPanel({ onClose }: Props) {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const conversation = useQuery(
    api.bot.conversations.getBySession,
    sessionId ? { sessionId } : 'skip',
  );

  const createConversation = useMutation(api.bot.conversations.create);

  // Auto-create conversation if none exists
  useEffect(() => {
    if (!sessionId) return;
    if (conversation === undefined) return; // loading
    if (conversation !== null) return; // already exists

    createConversation({ sessionId }).catch(console.error);
  }, [sessionId, conversation, createConversation]);

  const threadId = conversation?.threadId ?? null;

  return (
    <>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 h-14 bg-primary text-white">
        <Bot className="w-6 h-6" />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm">V-Shop Assistant</h2>
          <p className="text-xs opacity-80">Hỗ trợ 24/7</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 px-4 py-3">
        {threadId ? (
          <ChatBotMessages threadId={threadId} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-ink-muted">
            Đang kết nối...
          </div>
        )}
      </div>

      {/* Input */}
      <ChatBotInput threadId={threadId} sessionId={sessionId} />
    </>
  );
}
