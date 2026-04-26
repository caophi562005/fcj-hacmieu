import {
  Heart,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { MainShell } from '../../../components/MainShell';
import { ProductCard, formatVnd } from '../../../components/ProductCard';
import { PRODUCTS } from '../../../components/mockData';

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 6);

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <nav className="text-xs text-ink-subtle mb-3">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-1">/</span>
          <Link href="/search" className="hover:text-primary">
            Sản phẩm
          </Link>
          <span className="mx-1">/</span>
          <span className="text-ink line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 card p-3 md:p-5">
          {/* Gallery */}
          <div>
            <div className="aspect-square rounded-md overflow-hidden bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className={`aspect-square rounded overflow-hidden border ${
                    i === 0
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border'
                  }`}
                  aria-label={`Ảnh ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.discount ? (
              <span className="chip-flash inline-block mb-2">
                -{product.discount}%
              </span>
            ) : null}
            <h1 className="text-lg md:text-xl font-semibold leading-snug">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-ink-muted">
              {typeof product.rating === 'number' && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-ink font-medium">
                    {product.rating.toFixed(1)}
                  </span>
                  <span>(2.4k đánh giá)</span>
                </span>
              )}
              <span>·</span>
              <span>Đã bán {product.sold ?? '0'}</span>
            </div>

            <div className="bg-primary-50 rounded-md p-4 mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  {formatVnd(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-ink-subtle line-through">
                    {formatVnd(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-3 text-sm">
              <dt className="text-ink-muted">Vận chuyển</dt>
              <dd className="flex items-center gap-2 text-ink">
                <Truck className="w-4 h-4 text-primary" />
                <span>Giao trong 24h · Miễn phí ship</span>
              </dd>
              <dt className="text-ink-muted">Bảo hành</dt>
              <dd className="flex items-center gap-2 text-ink">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>12 tháng chính hãng</span>
              </dd>
              <dt className="text-ink-muted">Màu sắc</dt>
              <dd className="flex flex-wrap gap-2">
                {['Đen', 'Trắng', 'Cam', 'Xanh'].map((c, i) => (
                  <button
                    key={c}
                    className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                      i === 0
                        ? 'border-primary text-primary bg-primary-50'
                        : 'border-border text-ink hover:border-primary hover:text-primary'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </dd>
              <dt className="text-ink-muted">Số lượng</dt>
              <dd>
                <div className="inline-flex items-center border border-border rounded">
                  <button className="w-9 h-9 hover:bg-surface-muted">−</button>
                  <input
                    defaultValue={1}
                    className="w-12 h-9 text-center bg-white outline-none"
                    aria-label="Số lượng"
                  />
                  <button className="w-9 h-9 hover:bg-surface-muted">+</button>
                </div>
                <span className="ml-3 text-ink-subtle text-sm">
                  Còn 128 sản phẩm
                </span>
              </dd>
            </dl>

            <div className="flex flex-wrap gap-2 mt-5">
              <button className="btn-secondary btn-md flex-1 min-w-[160px]">
                <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
              </button>
              <Link
                href="/payment"
                className="btn-primary btn-md flex-1 min-w-[160px]"
              >
                Mua ngay
              </Link>
              <button
                className="btn-outline btn-md w-11 px-0"
                aria-label="Yêu thích"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Shop info */}
        <div className="card p-4 mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold">V-Shop Official Store</div>
              <div className="text-xs text-ink-muted">
                Tham gia 3 năm trước · 4.9 ★
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/chat?to=techzone" className="btn-outline btn-sm">
              <MessageCircle className="w-4 h-4" /> Chat ngay
            </Link>
            <Link href="/shop/techzone" className="btn-outline btn-sm">
              Xem shop
            </Link>
          </div>
        </div>

        {/* Description */}
        <div className="card p-5 mt-4">
          <h2 className="text-base font-semibold mb-3">Mô tả sản phẩm</h2>
          <div className="text-sm leading-relaxed text-ink-muted space-y-3">
            <p>
              {product.name} — sản phẩm chính hãng, chất lượng cao, được nhiều
              khách hàng tin dùng. Thiết kế hiện đại, trẻ trung, phù hợp với
              nhiều dịp sử dụng.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Chất liệu cao cấp, an toàn cho người sử dụng.</li>
              <li>Bảo hành 12 tháng chính hãng, đổi mới trong 7 ngày.</li>
              <li>Miễn phí vận chuyển toàn quốc cho đơn từ 200.000₫.</li>
            </ul>
          </div>
        </div>

        {/* Reviews */}
        <div className="card p-5 mt-4">
          <h2 className="text-base font-semibold mb-3">Đánh giá sản phẩm</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-3 pb-4 border-b border-border-subtle last:border-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.pravatar.cc/40?img=${10 + i}`}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Người dùng {i}</span>
                    <span className="flex items-center text-xs text-yellow-500">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star
                          key={k}
                          className="w-3 h-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted mt-1">
                    Sản phẩm đẹp đúng mô tả, giao hàng nhanh, đóng gói cẩn thận.
                    Sẽ ủng hộ shop lần sau.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        <div className="mt-6">
          <h2 className="text-base font-semibold mb-3">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {related.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </div>
    </MainShell>
  );
}
