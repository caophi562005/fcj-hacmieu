import type { ReactNode } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { ProductCard, type Product } from './ProductCard';
import { CATEGORIES } from './mockData';

const SORTS = ['Phổ biến', 'Mới nhất', 'Bán chạy', 'Giá tăng', 'Giá giảm'];

export function ProductBrowser({
  products,
  topSlot,
  resultLabel,
  emptyState,
  showPagination = true,
}: {
  products: Product[];
  topSlot?: ReactNode;
  resultLabel?: ReactNode;
  emptyState?: ReactNode;
  showPagination?: boolean;
}) {
  const isEmpty = products.length === 0;

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-4">
      <FilterSidebar />

      <div className="min-w-0">
        {topSlot}

        <div className="card p-3 mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-muted mr-1">Sắp xếp theo</span>
          {SORTS.map((s, i) => (
            <button
              key={s}
              type="button"
              className={`btn-sm rounded ${
                i === 0 ? 'bg-primary text-white' : 'btn-outline'
              }`}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            className="btn-outline btn-sm rounded ml-auto inline-flex items-center gap-1"
          >
            Giá <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="md:hidden btn-outline btn-sm rounded inline-flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        {resultLabel && (
          <div className="text-sm text-ink-muted mb-3">{resultLabel}</div>
        )}

        {isEmpty ? (
          (emptyState ?? (
            <div className="card p-10 text-center">
              <div className="text-lg font-semibold mb-1">
                Không có sản phẩm nào
              </div>
              <p className="text-sm text-ink-muted">
                Hãy thử thay đổi bộ lọc hoặc từ khóa khác.
              </p>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}

        {showPagination && !isEmpty && (
          <nav
            className="mt-6 flex items-center justify-center gap-1"
            aria-label="Phân trang"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                  n === 1
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:border-primary hover:text-primary'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="px-2 text-ink-subtle">…</span>
            <button
              type="button"
              className="w-9 h-9 rounded text-sm font-medium bg-white border border-border hover:border-primary hover:text-primary"
            >
              10
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

function FilterSidebar() {
  return (
    <aside className="hidden md:block card p-4 self-start sticky top-20">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <span className="font-semibold">Bộ lọc</span>
      </div>
      <div className="border-t border-border-subtle pt-3 mb-3">
        <h4 className="font-medium text-sm mb-2">Danh mục</h4>
        <ul className="space-y-1.5 text-sm text-ink-muted">
          {CATEGORIES.slice(0, 8).map((c) => (
            <li key={c.slug}>
              <label className="flex items-center gap-2 cursor-pointer hover:text-primary">
                <input type="checkbox" className="accent-primary" />
                <span>{c.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-border-subtle pt-3 mb-3">
        <h4 className="font-medium text-sm mb-2">Khoảng giá</h4>
        <div className="flex items-center gap-2">
          <input className="input h-9" placeholder="₫ Từ" />
          <span className="text-ink-subtle">-</span>
          <input className="input h-9" placeholder="₫ Đến" />
        </div>
        <button type="button" className="btn-primary btn-sm w-full mt-3">
          Áp dụng
        </button>
      </div>
      <div className="border-t border-border-subtle pt-3">
        <h4 className="font-medium text-sm mb-2">Đánh giá</h4>
        <ul className="space-y-1.5 text-sm text-ink-muted">
          {[5, 4, 3].map((r) => (
            <li key={r}>
              <label className="flex items-center gap-2 cursor-pointer hover:text-primary">
                <input
                  type="radio"
                  name="rating"
                  className="accent-primary"
                />
                <span>{r} sao trở lên</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
