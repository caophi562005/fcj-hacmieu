'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CategoryItem } from '../lib/catalog';

type FeaturedCategoriesCarouselProps = {
  categories: CategoryItem[];
};

const ITEMS_PER_PAGE = 10;

export function FeaturedCategoriesCarousel({
  categories,
}: FeaturedCategoriesCarouselProps) {
  const pages = useMemo(() => {
    const chunks: CategoryItem[][] = [];
    for (let i = 0; i < categories.length; i += ITEMS_PER_PAGE) {
      chunks.push(categories.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks;
  }, [categories]);

  const [activePage, setActivePage] = useState(0);

  if (pages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-ink-muted">
        Chưa có danh mục để hiển thị.
      </div>
    );
  }

  const isFirst = activePage === 0;
  const isLast = activePage === pages.length - 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-ink-subtle">
          Trang {activePage + 1}/{pages.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePage((p) => Math.max(0, p - 1))}
            disabled={isFirst}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-ink transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Danh mục trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActivePage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={isLast}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-ink transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Danh mục sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 md:grid-cols-10 gap-2.5">
        {pages[activePage].map((category) => (
          <Link
            key={category.id}
            href={`/search?categories=${category.id}`}
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-surface-muted transition-colors text-center cursor-pointer"
          >
            <span className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.logo}
                alt={category.name}
                className="w-9 h-9 md:w-10 md:h-10 object-contain"
              />
            </span>
            <span className="text-[13px] md:text-sm font-medium text-ink leading-tight line-clamp-2">
              {category.name}
            </span>
          </Link>
        ))}
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActivePage(index)}
              aria-label={`Đi tới trang danh mục ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                index === activePage
                  ? 'w-5 bg-primary'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
