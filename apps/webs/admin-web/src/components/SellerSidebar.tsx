'use client';

import { DashboardSidebar, type NavItem } from '@common/web-ui/index';
import {
  BookOpen,
  CircleDollarSign,
  FolderTree,
  LayoutDashboard,
  Megaphone,
  Package,
  Shapes,
  ShieldUser,
  ShoppingCart,
  Store,
  Tags,
  TicketPercent,
  Users,
} from 'lucide-react';

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
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/reports', label: 'Báo cáo vi phạm', icon: Megaphone },
];

export function SellerSidebar() {
  return (
    <DashboardSidebar
      items={ITEMS}
      title="V-Shop"
      subtitle="Admin Center"
      footerText="Hệ thống đang vận hành"
    />
  );
}
