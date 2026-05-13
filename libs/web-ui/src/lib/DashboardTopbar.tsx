import type { ReactNode } from 'react';

type Props = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function DashboardTopbar({ leftSlot, rightSlot }: Props) {
  return (
    <header
      className="fixed top-0 right-0 h-topbar z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-card flex items-center justify-between px-6 w-[calc(100%-theme(spacing.sidebar))] ml-sidebar"
      aria-label="Thanh công cụ"
    >
      <div className="flex items-center gap-4 min-w-0">{leftSlot}</div>
      <div className="flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}
