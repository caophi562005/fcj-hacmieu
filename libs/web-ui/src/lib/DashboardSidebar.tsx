'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

type Props = {
  items: NavItem[];
  title: string;
  subtitle: string;
  footerText?: string;
};

export function DashboardSidebar({
  items,
  title,
  subtitle,
  footerText,
}: Props) {
  const pathname = usePathname() ?? '/';

  return (
    <nav
      className="fixed left-0 top-0 w-sidebar h-full z-40 bg-sidebar border-r border-sidebar-border shadow-xl flex flex-col"
      aria-label="Điều hướng chính"
    >
      <div className="p-6">
        <Link href="/" className="block select-none">
          <h1 className="text-2xl font-black text-primary tracking-tight">
            {title}
          </h1>
          <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
        </Link>
      </div>

      <div className="flex flex-col gap-1 px-4 flex-1 overflow-y-auto scrollbar-none pb-4">
        {items.map((it) => {
          const active = it.match
            ? it.match(pathname)
            : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                'rounded-md px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ' +
                (active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-sidebar-hover')
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>

      {footerText && (
        <div className="p-6 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
            <span className="text-slate-300 text-sm">{footerText}</span>
          </div>
        </div>
      )}
    </nav>
  );
}
