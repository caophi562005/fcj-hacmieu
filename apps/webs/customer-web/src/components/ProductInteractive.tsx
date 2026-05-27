'use client';

import 'react-medium-image-zoom/dist/styles.css';

import { Flag, Heart, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import Zoom from 'react-medium-image-zoom';
import { toast } from 'react-toastify';
import { addCartItemAction } from '../lib/cart.actions';
import { formatVnd } from './ProductCard';
import { ReportModal } from './ReportModal';

type Variant = { value: string; options: string[] };
type Sku = {
  id: string;
  value: string;
  price: number;
  stock: number;
  image?: string;
};

export type ProductInteractiveProps = {
  productId: string;
  shopId: string;
  name: string;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  variants: Variant[];
  skus: Sku[];
  ratingCount: number;
  averageRate: number;
  soldCount: number;
};

export function ProductInteractive(props: ProductInteractiveProps) {
  const {
    productId,
    shopId,
    name,
    basePrice,
    virtualPrice,
    images,
    variants,
    skus,
    ratingCount,
    averageRate,
    soldCount,
  } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Gộp toàn bộ ảnh: ảnh sản phẩm + ảnh từng SKU (dedupe, giữ thứ tự).
  const allImages = useMemo(() => {
    const set = new Set<string>();
    const out: string[] = [];
    [...images, ...skus.map((s) => s.image).filter(Boolean)].forEach((u) => {
      if (typeof u === 'string' && u && !set.has(u)) {
        set.add(u);
        out.push(u);
      }
    });
    return out.length ? out : ['/placeholder.png'];
  }, [images, skus]);

  // Trạng thái lựa chọn cho từng variant theo index.
  const [selected, setSelected] = useState<(string | null)[]>(() =>
    variants.map(() => null),
  );
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string>(allImages[0]);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Tìm SKU khớp khi tất cả variant đã chọn (>=2 variant cần đầy đủ; 1 variant chỉ cần chọn 1).
  const matchedSku = useMemo<Sku | null>(() => {
    if (variants.length === 0) return skus[0] ?? null;
    if (selected.some((s) => s == null)) return null;
    const key = (selected as string[]).join('-');
    return skus.find((s) => s.value === key) ?? null;
  }, [variants.length, selected, skus]);

  const onPickOption = (vIdx: number, opt: string) => {
    setSelected((prev) => {
      const next = [...prev];
      next[vIdx] = prev[vIdx] === opt ? null : opt;
      return next;
    });
    // Nếu chỉ 1 variant: cập nhật ảnh ngay khi chọn option.
    if (variants.length === 1) {
      const sku = skus.find((s) => s.value === opt);
      if (sku?.image) setActiveImage(sku.image);
    }
  };

  // Khi đã match SKU đầy đủ, đồng bộ ảnh chính sang ảnh của SKU.
  useEffect(() => {
    if (matchedSku?.image) setActiveImage(matchedSku.image);
  }, [matchedSku?.id, matchedSku?.image]);

  const displayPrice = matchedSku?.price ?? basePrice;
  const stock = matchedSku?.stock ?? null;
  const discount =
    virtualPrice > displayPrice
      ? Math.round((1 - displayPrice / virtualPrice) * 100)
      : 0;
  const maxQty = stock ?? 99;

  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6 card p-3 md:p-5">
      {/* Gallery */}
      <div>
        <div className="aspect-square rounded-md overflow-hidden bg-surface-muted">
          <Zoom
            key={activeImage}
            zoomMargin={32}
            classDialog="rmiz-dialog-vshop"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt={name}
              className="w-full h-full object-cover cursor-zoom-in"
              draggable={false}
            />
          </Zoom>
        </div>
        {allImages.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {allImages.slice(0, 10).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(src)}
                onMouseEnter={() => setActiveImage(src)}
                className={`aspect-square rounded overflow-hidden border transition-colors ${
                  activeImage === src
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-border hover:border-primary'
                }`}
                aria-label="Chọn ảnh"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {discount > 0 && (
          <span className="chip-flash inline-block mb-2">-{discount}%</span>
        )}
        <h1 className="text-lg md:text-xl font-semibold leading-snug">
          {name}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-ink font-medium">
              {(averageRate || 0).toFixed(1)}
            </span>
            <span>({ratingCount} đánh giá)</span>
          </span>
          <span>·</span>
          <span>Đã bán {soldCount}</span>
        </div>

        <div className="bg-primary-50 rounded-md p-4 mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-primary">
              {formatVnd(displayPrice)}
            </span>
            {virtualPrice > displayPrice && (
              <span className="text-sm text-ink-subtle line-through">
                {formatVnd(virtualPrice)}
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

          {variants.map((v, vIdx) => (
            <FragmentRow key={v.value} label={v.value}>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => {
                  const active = selected[vIdx] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onPickOption(vIdx, opt)}
                      className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                        active
                          ? 'border-primary text-primary bg-primary-50'
                          : 'border-border text-ink hover:border-primary hover:text-primary'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </FragmentRow>
          ))}

          <dt className="text-ink-muted">Số lượng</dt>
          <dd>
            <div className="inline-flex items-center border border-border rounded">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 hover:bg-surface-muted"
              >
                −
              </button>
              <input
                value={qty}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/\D/g, ''));
                  if (!Number.isFinite(n)) return;
                  setQty(Math.max(1, Math.min(maxQty, n || 1)));
                }}
                className="w-12 h-9 text-center bg-white outline-none"
                aria-label="Số lượng"
              />
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="w-9 h-9 hover:bg-surface-muted"
              >
                +
              </button>
            </div>
            <span className="ml-3 text-ink-subtle text-sm">
              {stock != null ? `Còn ${stock} sản phẩm` : 'Chọn phân loại'}
            </span>
          </dd>
        </dl>

        <div className="flex flex-wrap gap-2 mt-5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (variants.length > 0 && !matchedSku) {
                toast.warn('Vui lòng chọn đầy đủ phân loại sản phẩm');
                return;
              }
              if (!matchedSku) {
                toast.error('Sản phẩm này chưa có phân loại khả dụng');
                return;
              }
              if (stock != null && qty > stock) {
                toast.warn(`Chỉ còn ${stock} sản phẩm trong kho`);
                return;
              }
              const productImage =
                matchedSku.image || allImages[0] || '/placeholder.png';
              startTransition(async () => {
                const result = await addCartItemAction({
                  productId,
                  productName: name,
                  productImage,
                  skuId: matchedSku.id,
                  skuValue: matchedSku.value,
                  shopId,
                  quantity: qty,
                });
                if (result.ok) {
                  toast.success('Đã thêm vào giỏ hàng');
                  router.refresh();
                } else {
                  toast.error(result.message);
                }
              });
            }}
            className="btn-secondary btn-md flex-1 min-w-[160px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            {isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
          <Link
            href="/payment"
            className="btn-primary btn-md flex-1 min-w-[160px] cursor-pointer"
          >
            Mua ngay
          </Link>
          <button
            type="button"
            className="btn-outline btn-md w-11 px-0 cursor-pointer"
            aria-label="Yêu thích"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="btn-outline btn-md w-11 px-0 cursor-pointer text-ink-muted hover:text-danger hover:border-danger hover:bg-danger-50 transition-colors"
            aria-label="Báo cáo sản phẩm"
            title="Báo cáo sản phẩm này"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="PRODUCT"
        targetId={productId}
      />
    </div>
  );
}

function FragmentRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}
