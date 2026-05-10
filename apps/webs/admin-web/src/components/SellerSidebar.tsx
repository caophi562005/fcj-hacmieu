'use client';

import {
  CircleDollarSign,
  FolderTree,
  LayoutDashboard,
  Package,
  Shapes,
  ShieldUser,
  ShoppingCart,
  Store,
  Tags,
  TicketPercent,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (p: string) => boolean;
};

const ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    match: (p) => p === '/',
  },
  { href: '/users', label: 'Quản lý tài khoản', icon: Users },
  { href: '/products', label: 'Quản lý sản phẩm', icon: Package },
  { href: '/categories', label: 'Quản lý danh mục', icon: FolderTree },
  { href: '/brands', label: 'Quản lý thương hiệu', icon: Tags },
  { href: '/attributes', label: 'Quản lý thuộc tính', icon: Shapes },
  { href: '/orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
  { href: '/promotions', label: 'Quản lý voucher', icon: TicketPercent },
  { href: '/merchant', label: 'Quản lý duyệt', icon: ShieldUser },
  { href: '/shops', label: 'Quản lý shop', icon: Store },
  { href: '/payouts', label: 'Yêu cầu rút tiền', icon: CircleDollarSign },
];

export function SellerSidebar() {
  const pathname = usePathname() ?? '/';

  return (
    <nav
      className="fixed left-0 top-0 w-sidebar h-full z-40 bg-sidebar border-r border-sidebar-border shadow-xl flex flex-col"
      aria-label="Điều hướng chính"
    >
      <div className="p-6">
        <Link href="/" className="block select-none">
          <h1 className="text-2xl font-black text-primary tracking-tight">
            V-Shop
          </h1>
          <p className="text-slate-400 text-xs mt-1">Admin Center</p>
        </Link>
      </div>

      <div className="flex flex-col gap-1 px-4 flex-1">
        {ITEMS.map((it) => {
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

      <div className="p-6 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
          <span className="text-slate-300 text-sm">Hệ thống đang vận hành</span>
        </div>
      </div>
    </nav>
  );
}
