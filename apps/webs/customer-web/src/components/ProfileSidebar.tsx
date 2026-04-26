'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserRound,
  Lock,
  Bell,
  Package,
  TicketPercent,
  Coins,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { logoutAction } from '../app/login/actions';
import type { MockUser } from '../lib/auth';

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/profile', label: 'Hồ sơ của tôi', icon: UserRound },
  { href: '/profile/password', label: 'Đổi mật khẩu', icon: Lock },
  { href: '/profile/notifications', label: 'Thông báo', icon: Bell },
  { href: '/profile/orders', label: 'Đơn mua', icon: Package },
  { href: '/profile/voucher', label: 'Kho voucher', icon: TicketPercent },
  { href: '/profile/xu', label: 'V-Xu', icon: Coins },
];

export function ProfileSidebar({ user }: { user: MockUser }) {
  const pathname = usePathname() ?? '';
  return (
    <aside className="w-full md:w-60 shrink-0">
      <div className="card p-4 mb-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover bg-surface-muted"
        />
        <div className="min-w-0">
          <div className="text-xs text-ink-subtle">Tài khoản</div>
          <div className="font-semibold truncate">{user.name}</div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary-50 rounded px-1.5 py-0.5">
            Hạng {user.membership}
          </div>
        </div>
      </div>
      <nav className="card p-2">
        <ul className="flex md:block overflow-x-auto md:overflow-visible scrollbar-none">
          {ITEMS.map((it) => {
            const active =
              it.href === '/profile'
                ? pathname === '/profile'
                : pathname.startsWith(it.href);
            const Icon = it.icon;
            return (
              <li key={it.href} className="shrink-0 md:shrink">
                <Link
                  href={it.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary font-semibold'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="shrink-0 md:shrink md:mt-1 md:border-t md:border-border-subtle md:pt-1">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-danger hover:bg-danger/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
