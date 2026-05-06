import { Info } from 'lucide-react';
import { redirect } from 'next/navigation';
import { isAuthed } from '../../lib/auth';
import { getMerchant, getShop } from '../../lib/shop';
import { MerchantInfo } from './_components/MerchantInfo';
import {
  EMPTY_SHOP,
  ShopForm,
  type ShopFormInitial,
} from './_components/ShopForm';

export const metadata = { title: 'Thiết lập Shop — V-Shop Seller' };

export default async function SettingsPage() {
  if (!(await isAuthed())) redirect('/login?next=/settings');

  const [merchant, shop] = await Promise.all([getMerchant(), getShop()]);

  // Chưa đăng ký bán hàng → không có merchant. Hiển thị notice.
  if (!merchant) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="card p-6 flex items-start gap-3 border border-amber-200 bg-amber-50/40">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Bạn chưa đăng ký tài khoản bán hàng
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Vui lòng hoàn tất bước đăng ký Merchant để có thể tạo và quản lý
                shop của bạn. Liên hệ hỗ trợ V-Shop để được hướng dẫn.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Có merchant nhưng chưa có shop → form tạo (mode=create).
  // Có cả hai → form chỉnh sửa (mode=edit).
  const initial: ShopFormInitial = shop
    ? {
        name: shop.name,
        description: shop.description,
        phone: shop.phone ?? '',
        status: shop.status,
        logo: shop.logo,
        banner: shop.banner,
        pickupAddress: shop.pickupAddress,
        returnAddress: shop.returnAddress,
      }
    : EMPTY_SHOP;

  return (
    <div className="space-y-6">
      <Header />
      <div className="max-w-4xl mx-auto space-y-6">
        <MerchantInfo merchant={merchant} />
        <ShopForm
          mode={shop ? 'edit' : 'create'}
          initial={initial}
          merchantId={merchant.id}
        />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Thiết lập Shop</h1>
      <p className="text-ink-muted text-sm mt-1">
        Quản lý thông tin pháp lý và hồ sơ shop của bạn.
      </p>
    </div>
  );
}
