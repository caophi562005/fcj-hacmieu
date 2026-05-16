'use client';

import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { ChatBotPanel } from './ChatBotPanel';

export function ChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] z-[60] rounded-xl shadow-lg border border-border-subtle overflow-hidden bg-white flex flex-col">
          <ChatBotPanel onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Bubble Button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-4 right-4 md:right-6 z-[60] w-14 h-14 rounded-full bg-primary text-white shadow-[0_4px_24px_rgba(255,107,53,0.35)] hover:bg-primary-600 transition-all hover:scale-105 flex items-center justify-center cursor-pointer"
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat hỗ trợ'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
}
