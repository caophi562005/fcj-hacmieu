'use client';

import { api } from '@common/convex/lib/api';
import { toUIMessages, useThreadMessages } from '@convex-dev/agent/react';
import { Bot } from 'lucide-react';
import { StickToBottom } from 'use-stick-to-bottom';

type Props = { threadId: string };

export function ChatBotMessages({ threadId }: Props) {
  const messages = useThreadMessages(
    api.bot.messages.list,
    { threadId },
    { initialNumItems: 20 },
  );

  const uiMessages = toUIMessages(messages.results ?? []);

  if (!uiMessages || uiMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-ink-muted">
        Đang tải...
      </div>
    );
  }

  return (
    <StickToBottom className="h-full overflow-y-auto" initial="instant">
      <StickToBottom.Content className="space-y-3 p-1">
        {uiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`text-sm py-2 px-3 rounded-xl whitespace-pre-wrap break-words ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-surface-muted text-ink rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </StickToBottom.Content>
    </StickToBottom>
  );
}
