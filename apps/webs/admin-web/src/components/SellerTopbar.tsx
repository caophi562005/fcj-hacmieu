import { Bell, HelpCircle, LogIn, Search } from 'lucide-react';
import Link from 'next/link';
import { getAuth } from '../lib/auth';
import { UserMenu } from './UserMenu';

export async function SellerTopbar() {
  const user = await getAuth();

  return (
    <header
      className="fixed top-0 right-0 h-topbar z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-card flex items-center justify-between px-6 w-[calc(100%-theme(spacing.sidebar))] ml-sidebar"
      aria-label="Thanh công cụ"
    >
      <div className="flex items-center gap-4 min-w-0">
        <label className="relative block max-w-xs w-64">
          <span className="sr-only">Tìm kiếm</span>
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Tìm kiếm nhanh..."
            className="h-10 w-full pl-9 pr-3 rounded-md bg-surface-alt border border-slate-200 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-10 h-10 rounded-full text-ink-muted hover:bg-surface-muted hover:text-primary transition-colors flex items-center justify-center"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded-full text-ink-muted hover:bg-surface-muted hover:text-primary transition-colors flex items-center justify-center"
          aria-label="Trợ giúp"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <span className="h-6 w-px bg-slate-200 mx-1" aria-hidden />

        {user ? (
          <UserMenu user={{ name: user.name, email: user.email, avatar: user.avatar }} />
        ) : (
          <Link
            href="/login"
            className="btn-primary btn-sm"
            aria-label="Đăng nhập"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </Link>
        )}
      </div>
    </header>
  );
}
