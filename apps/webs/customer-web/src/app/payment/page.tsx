import Link from 'next/link';
import { MainShell } from '../../components/MainShell';
import { getMyCart } from '../../lib/cart';
import { getProductById } from '../../lib/catalog';
import { getMyVouchers } from '../../lib/promotions';
import { getShopById } from '../../lib/shop';
import { getCurrentUser } from '../../lib/iam';
import { getDistricts, getProvinces, getWards } from '../../lib/location';
import { getMyWallet } from '../../lib/wallet';
import { PaymentView } from './PaymentView';
import type { PaymentShopGroupView, PaymentVoucherView } from './payment.types';

export const dynamic = 'force-dynamic';

type SearchParams = {
  items?: string;
  voucher?: string;
};

function parseSelectedIds(raw: string | undefined): Set<string> {
  return new Set(
    String(raw ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const selectedIds = parseSelectedIds(sp.items);

  if (selectedIds.size === 0) {
    return (
      <MainShell>
        <div className="container-page py-4 md:py-6">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">Thanh toán</h1>
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-muted mb-4">
              Bạn chưa chọn sản phẩm để thanh toán.
            </p>
            <Link href="/cart" className="btn-primary btn-md cursor-pointer">
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </MainShell>
    );
  }

  const cart = await getMyCart({ page: 1, limit: 100 });

  const productIds = Array.from(
    new Set(cart.cartItems.flatMap((g) => g.cartItems.map((i) => i.productId))),
  );

  const [shops, products, myVouchers, wallet, user, provinces] =
    await Promise.all([
      Promise.all(cart.cartItems.map((g) => getShopById(g.shopId))),
      Promise.all(productIds.map((id) => getProductById(id))),
      getMyVouchers({ status: 'AVAILABLE', limit: 50 }),
      getMyWallet(),
      getCurrentUser(),
      getProvinces(),
    ]);

  const [initialDistricts, initialWards] = await Promise.all([
    user?.provinceId ? getDistricts(user.provinceId) : Promise.resolve([]),
    user?.districtId ? getWards(user.districtId) : Promise.resolve([]),
  ]);

  const skuPrice = new Map<string, number>();
  const productBasePrice = new Map<string, number>();
  products.forEach((p) => {
    if (!p) return;
    productBasePrice.set(p.id, p.basePrice);
    p.skus?.forEach((s) => skuPrice.set(s.id, s.price));
  });

  const groups: PaymentShopGroupView[] = cart.cartItems
    .map((g, idx) => {
      const shop = shops[idx];
      return {
        shopId: g.shopId,
        shopName: shop?.name ?? 'Shop không xác định',
        shopLogo: shop?.logo ?? null,
        pickupDistrictId: shop?.pickupDistrictId ?? 0,
        pickupWardId: shop?.pickupWardId ?? 0,
        items: g.cartItems
          .filter((it) => selectedIds.has(it.id))
          .map((it) => ({
            id: it.id,
            productId: it.productId,
            productName: it.productName,
            productImage: it.productImage,
            skuValue: it.skuValue,
            quantity: it.quantity,
            price:
              skuPrice.get(it.skuId) ?? productBasePrice.get(it.productId) ?? 0,
            provinceId:
              products.find((p) => p?.id === it.productId)?.provinceId ?? 0,
            districtId:
              products.find((p) => p?.id === it.productId)?.districtId ?? 0,
            wardId: products.find((p) => p?.id === it.productId)?.wardId ?? 0,
            weightGram:
              products.find((p) => p?.id === it.productId)?.weightGram ?? 500,
          })),
      };
    })
    .filter((g) => g.items.length > 0);

  const voucher =
    myVouchers.redemptions.find((v) => v.code === (sp.voucher ?? '')) ?? null;
  const voucherView: PaymentVoucherView | null = voucher
    ? {
        id: voucher.id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minOrderSubtotal: voucher.minOrderSubtotal,
        maxDiscount: voucher.maxDiscount,
      }
    : null;

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-4">Thanh toán</h1>
        {groups.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-muted mb-4">
              Các sản phẩm đã chọn không còn trong giỏ hàng.
            </p>
            <Link href="/cart" className="btn-primary btn-md cursor-pointer">
              Quay lại giỏ hàng
            </Link>
          </div>
        ) : (
          <PaymentView
            groups={groups}
            voucher={voucherView}
            availableCoin={Math.max(0, Math.floor(wallet.balance ?? 0))}
            initialName={user?.username ?? ''}
            initialPhone={user?.phoneNumber ?? ''}
            initialAddress={user?.address ?? ''}
            provinces={provinces}
            initialProvinceId={user?.provinceId ?? 0}
            initialDistrictId={user?.districtId ?? 0}
            initialWardId={user?.wardId ?? 0}
            initialDistricts={initialDistricts}
            initialWards={initialWards}
          />
        )}
      </div>
    </MainShell>
  );
}
