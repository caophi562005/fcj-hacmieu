'use client';

import type { LucideIcon } from 'lucide-react';
import { House, LayoutGrid, MessageCircle, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
  match?: (p: string) => boolean;
};

const ITEMS: Item[] = [
  { href: '/', label: 'Trang chủ', icon: House, match: (p) => p === '/' },
  {
    href: '/search',
    label: 'Danh mục',
    icon: LayoutGrid,
    match: (p) => p.startsWith('/search'),
  },
  {
    href: '/chat',
    label: 'Tin nhắn',
    icon: MessageCircle,
    badge: true,
    match: (p) => p.startsWith('/chat'),
  },
  {
    href: '/profile',
    label: 'Tài khoản',
    icon: UserRound,
    match: (p) => p.startsWith('/profile'),
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? '/';
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-white border-t border-border-subtle shadow-nav-up flex items-stretch justify-around"
      aria-label="Điều hướng chính"
    >
      {ITEMS.map((it) => {
        const active = it.match ? it.match(pathname) : pathname === it.href;
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
              active ? 'text-primary' : 'text-ink-muted hover:text-primary'
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
            <span>{it.label}</span>
            {it.badge && (
              <span className="absolute top-2 right-1/2 translate-x-[14px] w-2 h-2 rounded-full bg-danger" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
