'use client';

import { DiscountTypeValues } from '@common/constants/promotion.constant';
import type { PromotionRedemptionResponse } from '@common/interfaces/models/promotion';
import {
  Check,
  ChevronDown,
  Loader2,
  Store,
  Tag,
  TicketPercent,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { formatVnd } from '../../components/ProductCard';
import {
  addCartItemAction,
  deleteCartItemAction,
} from '../../lib/cart.actions';

export type CartItemView = {
  id: string;
  productId: string;
  shopId: string;
  skuId: string;
  productName: string;
  productImage: string | null;
  skuValue: string;
  quantity: number;
  price: number;
};

export type CartShopView = {
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  items: CartItemView[];
};

const DEBOUNCE_MS = 1000;

// Tính discount cho 1 voucher dựa trên subtotal hiện tại.
// Trả về null nếu voucher không áp dụng được (vd: chưa đủ minOrderSubtotal).
function calcDiscount(
  voucher: PromotionRedemptionResponse,
  subtotal: number,
): number | null {
  if (subtotal < (voucher.minOrderSubtotal ?? 0)) return null;
  if (voucher.discountType === DiscountTypeValues.PERCENT) {
    // PERCENT lưu ×100 (100 = 1%, 10000 = 100%) — xem schema PromotionSchema.
    const raw = Math.floor((subtotal * voucher.discountValue) / 10000);
    return voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw;
  }
  return Math.min(voucher.discountValue, subtotal);
}

function voucherTitle(v: PromotionRedemptionResponse): string {
  return v.discountType === DiscountTypeValues.PERCENT
    ? `Giảm ${(v.discountValue / 100).toFixed(0)}%`
    : `Giảm ${formatVnd(v.discountValue)}`;
}

function voucherDesc(v: PromotionRedemptionResponse): string {
  const parts: string[] = [];
  if (v.minOrderSubtotal > 0)
    parts.push(`Đơn từ ${formatVnd(v.minOrderSubtotal)}`);
  if (v.maxDiscount && v.discountType === DiscountTypeValues.PERCENT)
    parts.push(`Tối đa ${formatVnd(v.maxDiscount)}`);
  return parts.length ? parts.join(' • ') : 'Áp dụng cho đơn hợp lệ';
}

export function CartView({
  groups,
  vouchers,
}: {
  groups: CartShopView[];
  vouchers: PromotionRedemptionResponse[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Quantity hiển thị (optimistic) — cho phép tăng/giảm tức thì.
  const [qtyMap, setQtyMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      groups.flatMap((g) => g.items.map((i) => [i.id, i.quantity])),
    ),
  );

  // Đồng bộ lại khi server data thay đổi (sau router.refresh).
  useEffect(() => {
    setQtyMap(
      Object.fromEntries(
        groups.flatMap((g) => g.items.map((i) => [i.id, i.quantity])),
      ),
    );
  }, [groups]);

  // Track delta cộng dồn từ lần gọi API gần nhất, theo cartItemId.
  const pendingDeltaRef = useRef<Record<string, number>>({});
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // cartItemIds đang gọi API (disable nút).
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  // Cleanup timers khi unmount.
  useEffect(() => {
    const timers = timerRef.current;
    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t));
    };
  }, []);

  const flushQty = async (item: CartItemView) => {
    const delta = pendingDeltaRef.current[item.id] ?? 0;
    delete pendingDeltaRef.current[item.id];
    delete timerRef.current[item.id];
    if (delta === 0) return;

    setBusyIds((s) => ({ ...s, [item.id]: true }));
    const res = await addCartItemAction({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage || '',
      skuId: item.skuId,
      skuValue: item.skuValue,
      shopId: item.shopId,
      // BE addCartItem nhận delta: dương = tăng, âm = giảm.
      quantity: delta,
    });
    setBusyIds((s) => {
      const n = { ...s };
      delete n[item.id];
      return n;
    });

    if (res.ok) {
      toast.success('Cập nhật số lượng thành công');
      startTransition(() => router.refresh());
    } else {
      // Rollback optimistic.
      setQtyMap((m) => ({ ...m, [item.id]: item.quantity }));
      toast.error(res.message);
    }
  };

  const scheduleQtyChange = (item: CartItemView, delta: number) => {
    const current = qtyMap[item.id] ?? item.quantity;
    const next = current + delta;
    if (next < 1) return; // không cho xuống dưới 1 — muốn xoá thì dùng nút xoá.

    setQtyMap((m) => ({ ...m, [item.id]: next }));
    pendingDeltaRef.current[item.id] =
      (pendingDeltaRef.current[item.id] ?? 0) + delta;

    if (timerRef.current[item.id]) clearTimeout(timerRef.current[item.id]);
    timerRef.current[item.id] = setTimeout(() => {
      void flushQty(item);
    }, DEBOUNCE_MS);
  };

  const handleDelete = async (item: CartItemView) => {
    if (busyIds[item.id]) return;
    // Huỷ debounce qty đang chờ nếu có.
    if (timerRef.current[item.id]) {
      clearTimeout(timerRef.current[item.id]);
      delete timerRef.current[item.id];
      delete pendingDeltaRef.current[item.id];
    }
    setBusyIds((s) => ({ ...s, [item.id]: true }));
    const res = await deleteCartItemAction(item.id);
    setBusyIds((s) => {
      const n = { ...s };
      delete n[item.id];
      return n;
    });
    if (res.ok) {
      toast.success('Đã xoá khỏi giỏ hàng');
      startTransition(() => router.refresh());
    } else {
      toast.error(res.message);
    }
  };

  // ---- Selection ----
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allItemIds = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => i.id)),
    [groups],
  );
  const allChecked =
    allItemIds.length > 0 && allItemIds.every((id) => selected[id]);

  const toggleItem = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  const toggleShop = (shop: CartShopView) => {
    const ids = shop.items.map((i) => i.id);
    const allOn = ids.every((id) => selected[id]);
    setSelected((s) => {
      const next = { ...s };
      ids.forEach((id) => (next[id] = !allOn));
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((s) => {
      const next = { ...s };
      const turnOn = !allChecked;
      allItemIds.forEach((id) => (next[id] = turnOn));
      return next;
    });
  };

  const subtotal = useMemo(
    () =>
      groups
        .flatMap((g) => g.items)
        .filter((it) => selected[it.id])
        .reduce((s, it) => s + it.price * (qtyMap[it.id] ?? it.quantity), 0),
    [groups, selected, qtyMap],
  );

  const selectedCount = allItemIds.filter((id) => selected[id]).length;
  const shipping = 0;

  // ---- Voucher selector ----
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null,
  );
  const voucherPanelRef = useRef<HTMLDivElement | null>(null);

  // Click outside để đóng panel.
  useEffect(() => {
    if (!voucherOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        voucherPanelRef.current &&
        !voucherPanelRef.current.contains(e.target as Node)
      ) {
        setVoucherOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [voucherOpen]);

  const selectedVoucher = useMemo(
    () => vouchers.find((v) => v.id === selectedVoucherId) ?? null,
    [vouchers, selectedVoucherId],
  );

  // Tự bỏ chọn voucher nếu subtotal tụt xuống dưới ngưỡng.
  useEffect(() => {
    if (!selectedVoucher) return;
    if (subtotal < (selectedVoucher.minOrderSubtotal ?? 0)) {
      setSelectedVoucherId(null);
      toast.info('Voucher đã bị bỏ vì đơn hàng không còn đủ điều kiện');
    }
  }, [subtotal, selectedVoucher]);

  const discount = selectedVoucher
    ? (calcDiscount(selectedVoucher, subtotal) ?? 0)
    : 0;
  const total = subtotal + shipping - discount;

  const handleProceedToPayment = () => {
    if (selectedCount === 0) return;

    const hasSyncInFlight = Object.values(busyIds).some(Boolean);
    const hasPendingDelta = Object.values(pendingDeltaRef.current).some(
      (delta) => delta !== 0,
    );
    if (hasSyncInFlight || hasPendingDelta) {
      toast.info(
        'Vui lòng đợi cập nhật giỏ hàng hoàn tất trước khi thanh toán',
      );
      return;
    }

    const selectedItemIds = groups
      .flatMap((g) => g.items)
      .filter((it) => selected[it.id])
      .map((it) => it.id);

    if (selectedItemIds.length === 0) {
      toast.info('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
      return;
    }

    const params = new URLSearchParams();
    params.set('items', selectedItemIds.join(','));
    if (selectedVoucher?.code) {
      params.set('voucher', selectedVoucher.code);
    }

    router.push(`/payment?${params.toString()}`);
  };

  if (groups.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-lg font-semibold mb-1">Giỏ hàng trống</div>
        <p className="text-sm text-ink-muted mb-4">
          Khám phá hàng triệu sản phẩm chính hãng tại V-Shop nhé!
        </p>
        <Link href="/search" className="btn-primary btn-md cursor-pointer">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
      {/* Items */}
      <div className="min-w-0 space-y-3">
        {/* Bulk toolbar */}
        <div className="card px-3 sm:px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="w-4 h-4 accent-primary cursor-pointer"
              aria-label="Chọn tất cả"
            />
            <span className="font-medium">
              Chọn tất cả ({allItemIds.length})
            </span>
          </label>
          <span className="ml-auto text-ink-muted">
            Đã chọn <strong className="text-ink">{selectedCount}</strong> /{' '}
            {allItemIds.length} sản phẩm
          </span>
        </div>

        {groups.map((g) => {
          const shopAllChecked = g.items.every((i) => selected[i.id]);
          return (
            <div key={g.shopId} className="card overflow-hidden">
              {/* Shop header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-surface-muted/40">
                <input
                  type="checkbox"
                  checked={shopAllChecked}
                  onChange={() => toggleShop(g)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                  aria-label={`Chọn shop ${g.shopName}`}
                />
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-border-subtle flex items-center justify-center shrink-0">
                  {g.shopLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.shopLogo}
                      alt={g.shopName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-4 h-4 text-ink-subtle" aria-hidden />
                  )}
                </div>
                <Link
                  href={`/shop/${g.shopId}`}
                  className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer line-clamp-1"
                >
                  {g.shopName}
                </Link>
              </div>

              {/* Header row (desktop) */}
              <div className="hidden xl:grid grid-cols-[16px_minmax(0,1fr)_88px_106px_100px_32px] gap-3 items-center px-4 py-2 border-b border-border-subtle text-xs text-ink-subtle">
                <span></span>
                <span>Sản phẩm</span>
                <span className="text-center">Đơn giá</span>
                <span className="text-center">Số lượng</span>
                <span className="text-right">Thành tiền</span>
                <span></span>
              </div>

              {g.items.map((it) => {
                const qty = qtyMap[it.id] ?? it.quantity;
                const busy = !!busyIds[it.id];
                return (
                  <div
                    key={it.id}
                    className="grid grid-cols-[16px_minmax(0,1fr)_32px] xl:grid-cols-[16px_minmax(0,1fr)_88px_106px_100px_32px] items-center gap-x-3 gap-y-2 p-3 sm:p-4 border-b border-border-subtle last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={!!selected[it.id]}
                      onChange={() => toggleItem(it.id)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                      aria-label={`Chọn ${it.productName}`}
                    />

                    <div className="col-span-2 min-w-0 xl:col-span-1">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={it.productImage || '/placeholder.png'}
                          alt={it.productName}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded object-cover bg-surface-muted shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/product/${it.productId}`}
                            className="text-sm line-clamp-2 break-words hover:text-primary transition-colors cursor-pointer"
                          >
                            {it.productName}
                          </Link>
                          <div className="text-xs text-ink-subtle mt-1 line-clamp-1">
                            Phân loại: {it.skuValue || 'Mặc định'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-start-2 col-span-2 xl:col-auto xl:text-center text-sm break-words">
                      <span className="xl:hidden text-ink-subtle mr-1">
                        Giá:
                      </span>
                      <span className="text-primary font-semibold">
                        {it.price > 0 ? formatVnd(it.price) : '—'}
                      </span>
                    </div>

                    <div className="col-start-2 row-start-3 xl:col-auto xl:row-auto flex xl:justify-center">
                      <div className="inline-flex items-center border border-border rounded">
                        <button
                          type="button"
                          onClick={() => scheduleQtyChange(it, -1)}
                          disabled={busy || qty <= 1}
                          className="w-8 h-8 hover:bg-surface-muted cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Giảm số lượng"
                        >
                          −
                        </button>
                        <div className="w-10 h-8 flex items-center justify-center bg-white text-sm relative">
                          {busy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-muted" />
                          ) : (
                            qty
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => scheduleQtyChange(it, 1)}
                          disabled={busy}
                          className="w-8 h-8 hover:bg-surface-muted cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Tăng số lượng"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-start-2 col-span-2 row-start-4 xl:col-auto xl:row-auto xl:text-right text-sm font-semibold text-primary break-words">
                      <span className="xl:hidden text-ink-subtle font-normal mr-1">
                        Thành tiền:
                      </span>
                      {it.price > 0 ? formatVnd(it.price * qty) : '—'}
                    </div>

                    <div className="col-start-3 row-start-3 xl:col-auto xl:row-auto text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(it)}
                        disabled={busy}
                        className="w-8 h-8 inline-flex items-center justify-center rounded text-ink-muted hover:text-danger hover:bg-danger/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Xóa"
                        title="Xoá khỏi giỏ hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        <div ref={voucherPanelRef} className="card p-4 relative">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setVoucherOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setVoucherOpen((v) => !v);
              }
            }}
            className="w-full flex items-center gap-3 text-left cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            aria-expanded={voucherOpen}
            aria-haspopup="listbox"
          >
            <TicketPercent className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              {selectedVoucher ? (
                <>
                  <div className="font-medium text-sm line-clamp-1">
                    {voucherTitle(selectedVoucher)}{' '}
                    <span className="text-ink-subtle font-normal">
                      ({selectedVoucher.code})
                    </span>
                  </div>
                  <div className="text-xs text-success mt-0.5">
                    Đã áp dụng • Giảm {formatVnd(discount)}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium text-sm">Chọn mã giảm giá</div>
                  <div className="text-xs text-ink-subtle mt-0.5">
                    {vouchers.length > 0
                      ? `${vouchers.length} mã khả dụng`
                      : 'Bạn chưa có mã nào — vào "Kho voucher" để thu thập'}
                  </div>
                </>
              )}
            </div>
            {selectedVoucher ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVoucherId(null);
                }}
                className="w-7 h-7 inline-flex items-center justify-center rounded-full text-ink-muted hover:text-danger hover:bg-danger/5 transition-colors cursor-pointer"
                aria-label="Bỏ chọn voucher"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <ChevronDown
                className={`w-4 h-4 text-ink-muted transition-transform ${
                  voucherOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            )}
          </div>

          {voucherOpen && (
            <div
              role="listbox"
              className="absolute z-20 left-0 right-0 top-full mt-2 max-h-[360px] overflow-y-auto rounded-lg border border-border-subtle bg-white shadow-lg"
            >
              {vouchers.length === 0 ? (
                <div className="p-6 text-center">
                  <Tag className="w-6 h-6 mx-auto text-ink-subtle mb-2" />
                  <div className="text-sm font-medium mb-1">
                    Chưa có voucher nào
                  </div>
                  <Link
                    href="/profile/voucher"
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    Đi tới kho voucher
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {vouchers.map((v) => {
                    const eligible = subtotal >= (v.minOrderSubtotal ?? 0);
                    const isSelected = v.id === selectedVoucherId;
                    const Icon =
                      v.discountType === DiscountTypeValues.PERCENT
                        ? TicketPercent
                        : Tag;
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          disabled={!eligible}
                          onClick={() => {
                            setSelectedVoucherId(isSelected ? null : v.id);
                            setVoucherOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${
                            eligible
                              ? 'hover:bg-surface-muted cursor-pointer'
                              : 'opacity-60 cursor-not-allowed'
                          } ${isSelected ? 'bg-primary/5' : ''}`}
                          aria-selected={isSelected}
                          role="option"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              eligible
                                ? 'bg-primary/10 text-primary'
                                : 'bg-surface-muted text-ink-subtle'
                            }`}
                          >
                            <Icon className="w-4 h-4" aria-hidden />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium line-clamp-1">
                              {voucherTitle(v)}
                              <span className="ml-2 text-xs text-ink-subtle font-normal">
                                {v.code}
                              </span>
                            </div>
                            <div className="text-xs text-ink-subtle mt-0.5 line-clamp-1">
                              {voucherDesc(v)}
                            </div>
                            {!eligible && (
                              <div className="text-xs text-danger mt-1">
                                Cần mua thêm{' '}
                                {formatVnd(
                                  (v.minOrderSubtotal ?? 0) - subtotal,
                                )}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <Check
                              className="w-4 h-4 text-primary shrink-0 mt-1"
                              aria-hidden
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <aside className="min-w-0 space-y-3">
        <div className="card p-4 lg:sticky lg:top-20">
          <h2 className="font-semibold mb-3">Tóm tắt đơn hàng</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-ink-muted">
                Tạm tính ({selectedCount} sản phẩm)
              </dt>
              <dd>{formatVnd(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Phí vận chuyển</dt>
              <dd className="text-success">Miễn phí</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Giảm giá</dt>
              <dd className="text-success">-{formatVnd(discount)}</dd>
            </div>
            <div className="border-t border-border-subtle pt-2 flex justify-between text-base">
              <dt className="font-semibold">Tổng cộng</dt>
              <dd className="font-bold text-primary text-lg">
                {formatVnd(total)}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleProceedToPayment}
            className="btn-primary btn-lg w-full mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Tiến hành thanh toán
          </button>
          <Link
            href="/search"
            className="btn-ghost btn-md w-full mt-2 text-primary cursor-pointer"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </aside>
    </div>
  );
}
