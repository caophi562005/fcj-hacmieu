'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { useTransition } from 'react';
import { refreshNotificationsAction } from './actions';

export function RefreshButton() {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await refreshNotificationsAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
      aria-label="Làm mới thông báo"
      title="Làm mới"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
    </button>
  );
}
