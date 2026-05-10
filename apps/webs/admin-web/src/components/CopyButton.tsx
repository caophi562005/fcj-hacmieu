'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type Props = {
  value: string;
  label?: string;
  className?: string;
};

export function CopyButton({ value, label = 'Copy', className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={copied ? 'Đã copy' : label}
      className={`inline-flex items-center justify-center w-7 h-7 rounded hover:bg-surface-muted text-ink-subtle hover:text-primary transition-colors ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-success" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
