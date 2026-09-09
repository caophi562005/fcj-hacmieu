'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import type { CategoryItem } from '../lib/catalog';

type Props = {
  categories: CategoryItem[];
  selectedCategories: string[];
  minPrice?: number;
  maxPrice?: number;
};

// Sidebar lọc dùng `router.push` để soft-navigate, giữ Header + SSE persistent.
// Form vẫn là native form (uncontrolled inputs) → preserve native UX (Enter
// submit, browser autofill, validation messages).
export function FilterForm({
  categories,
  selectedCategories,
  minPrice,
  maxPrice,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();
  const selectedSet = new Set(selectedCategories);
  const hasActiveFilter =
    selectedCategories.length > 0 ||
    typeof minPrice === 'number' ||
    typeof maxPrice === 'number';

  const buildClearHref = () => {
    const next = new URLSearchParams();
    for (const key of ['q', 'sortBy', 'orderBy'] as const) {
      const v = sp?.get(key);
      if (v) next.set(key, v);
    }
    const qs = next.toString();
    return qs ? `/search?${qs}` : '/search';
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    // Giữ keyword & sort hiện tại
    for (const key of ['q', 'sortBy', 'orderBy'] as const) {
      const v = sp?.get(key);
      if (v) next.set(key, v);
    }
    // categories (multiple)
    for (const c of fd.getAll('categories')) {
      const s = String(c).trim();
      if (s) next.append('categories', s);
    }
    // price range — chỉ append khi > 0
    const minP = String(fd.get('minPrice') ?? '').trim();
    const maxP = String(fd.get('maxPrice') ?? '').trim();
    if (minP && Number(minP) > 0) next.set('minPrice', minP);
    if (maxP && Number(maxP) > 0) next.set('maxPrice', maxP);
    // reset về trang 1 khi đổi filter
    const qs = next.toString();
    router.push(qs ? `/search?${qs}` : '/search');
    setMobileOpen(false);
  };

  return (
    <aside className="min-w-0 card p-4 self-start md:sticky md:top-20">
      <button
        type="button"
        className="md:hidden flex w-full items-center gap-2 text-left text-sm font-semibold"
        aria-expanded={mobileOpen}
        aria-controls={panelId}
        onClick={() => setMobileOpen((open) => !open)}
      >
        <SlidersHorizontal className="w-4 h-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1">
          Bộ lọc danh mục & giá
          {hasActiveFilter && (
            <span className="block text-xs font-normal text-primary">
              Đang áp dụng
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <form
        id={panelId}
        key={JSON.stringify([selectedCategories, minPrice, maxPrice])}
        onSubmit={onSubmit}
        className={`${mobileOpen ? 'flex' : 'hidden'} md:flex flex-col mt-4 md:mt-0`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span className="font-semibold">Bộ lọc</span>
          </div>
          {hasActiveFilter && (
            <Link
              href={buildClearHref()}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Xóa lọc
            </Link>
          )}
        </div>

        {/* Danh mục cha */}
        <div className="border-t border-border-subtle pt-3 mb-3">
          <h4 className="font-medium text-sm mb-2">Danh mục</h4>
          {categories.length === 0 ? (
            <p className="text-xs text-ink-subtle">Chưa có danh mục.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-ink-muted max-h-72 overflow-auto pr-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary">
                    <input
                      type="checkbox"
                      name="categories"
                      value={c.id}
                      defaultChecked={selectedSet.has(c.id)}
                      className="accent-primary"
                    />
                    <span className="line-clamp-1">{c.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Khoảng giá */}
        <div className="border-t border-border-subtle pt-3 mb-3">
          <h4 className="font-medium text-sm mb-2">Khoảng giá</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              name="minPrice"
              defaultValue={minPrice ?? ''}
              className="input min-w-0 h-9"
              aria-label="Giá tối thiểu"
              placeholder="₫ Từ"
            />
            <span className="text-ink-subtle">-</span>
            <input
              type="number"
              min={0}
              name="maxPrice"
              defaultValue={maxPrice ?? ''}
              className="input min-w-0 h-9"
              aria-label="Giá tối đa"
              placeholder="₫ Đến"
            />
          </div>
          <button
            type="submit"
            className="btn-primary btn-sm w-full mt-3 cursor-pointer"
          >
            Áp dụng
          </button>
        </div>

        {/* Đánh giá — tạm thời disable */}
        <div className="border-t border-border-subtle pt-3 opacity-60">
          <h4 className="font-medium text-sm mb-2">
            Đánh giá{' '}
            <span className="text-xs text-ink-subtle font-normal">
              (sắp ra mắt)
            </span>
          </h4>
          <ul className="space-y-1.5 text-sm text-ink-muted">
            {[5, 4, 3].map((r) => (
              <li key={r}>
                <label className="flex items-center gap-2 cursor-not-allowed">
                  <input
                    type="radio"
                    name="rating"
                    className="accent-primary"
                    disabled
                  />
                  <span>{r} sao trở lên</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </aside>
  );
}
