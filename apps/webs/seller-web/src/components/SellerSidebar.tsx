'use client';

import { DashboardSidebar, type NavItem } from '@common/web-ui/index';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Video,
  Wallet,
  Clock3,
  Megaphone,
} from 'lucide-react';

const ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    match: (p) => p === '/',
  },
  { href: '/products', label: 'Quản lý Sản phẩm', icon: Package },
  { href: '/videos', label: 'Quản lý Video', icon: Video },
  { href: '/orders', label: 'Quản lý Đơn hàng', icon: ShoppingCart },
  { href: '/chat', label: 'Quản lý Tin nhắn', icon: MessageSquare },
  {
    href: '/finance',
    label: 'Tài chính',
    icon: Wallet,
    match: (p) => p === '/finance' || p.startsWith('/finance/payouts'),
  },
  { href: '/finance/settlements', label: 'Lịch giải ngân', icon: Clock3 },
  {
    href: '/marketing/placements',
    label: 'Quảng bá sản phẩm',
    icon: Megaphone,
  },
  { href: '/settings', label: 'Thiết lập Shop', icon: Settings },
];

export function SellerSidebar() {
  return (
    <DashboardSidebar
      items={ITEMS}
      title="V-Shop"
      subtitle="Seller Center"
      footerText="Shop đang hoạt động"
    />
  );
}
