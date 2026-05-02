import { MainShell } from '../../components/MainShell';
import { getMyCart } from '../../lib/cart';
import { getProductById } from '../../lib/catalog';
import { getShopById } from '../../lib/shop';
import { CartView, type CartShopView } from './CartView';

export const dynamic = 'force-dynamic';

type SearchParams = { page?: string; limit?: string };

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(sp.limit) || 20));

  const cart = await getMyCart({ page, limit });

  // Tập hợp toàn bộ productId duy nhất → fetch chi tiết để lấy price theo skuId.
  const productIds = Array.from(
    new Set(cart.cartItems.flatMap((g) => g.cartItems.map((i) => i.productId))),
  );

  const [shops, products] = await Promise.all([
    Promise.all(cart.cartItems.map((g) => getShopById(g.shopId))),
    Promise.all(productIds.map((id) => getProductById(id))),
  ]);

  // Lookup price theo skuId; fallback basePrice nếu không tìm thấy SKU.
  const skuPrice = new Map<string, number>();
  const productBasePrice = new Map<string, number>();
  products.forEach((p) => {
    if (!p) return;
    productBasePrice.set(p.id, p.basePrice);
    p.skus?.forEach((s) => skuPrice.set(s.id, s.price));
  });

  const groups: CartShopView[] = cart.cartItems.map((g, idx) => {
    const shop = shops[idx];
    return {
      shopId: g.shopId,
      shopName: shop?.name ?? 'Shop không xác định',
      shopLogo: shop?.logo ?? null,
      items: g.cartItems.map((it) => ({
        id: it.id,
        productId: it.productId,
        shopId: g.shopId,
        skuId: it.skuId,
        productName: it.productName,
        productImage: it.productImage,
        skuValue: it.skuValue,
        quantity: it.quantity,
        price:
          skuPrice.get(it.skuId) ?? productBasePrice.get(it.productId) ?? 0,
      })),
    };
  });

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-4">
          Giỏ hàng của bạn
        </h1>
        <CartView groups={groups} />
      </div>
    </MainShell>
  );
}
