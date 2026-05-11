import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { getAuth } from '../lib/auth';
import { UserMenu } from './UserMenu';

export async function SellerTopbar() {
  const user = await getAuth();

  return (
    <header
      className="fixed top-0 right-0 h-topbar z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-card flex items-center justify-end px-6 w-[calc(100%-theme(spacing.sidebar))] ml-sidebar"
      aria-label="Thanh công cụ"
    >
      <div className="flex items-center gap-2">
        {user ? (
          <UserMenu
            user={{ name: user.name, email: user.email, avatar: user.avatar }}
          />
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
