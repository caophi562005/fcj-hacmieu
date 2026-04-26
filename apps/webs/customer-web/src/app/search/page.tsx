import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { MainShell } from '../../components/MainShell';
import { ProductBrowser } from '../../components/ProductBrowser';
import { PRODUCTS } from '../../components/mockData';

const POPULAR = [
  'Áo thun nam',
  'Tai nghe',
  'Nồi chiên không dầu',
  'Smartwatch',
  'Son lì',
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp?.q ?? '').trim();
  const results = q
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    : PRODUCTS;

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <nav className="text-xs text-ink-subtle mb-3" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>{' '}
          <span className="mx-1">/</span>{' '}
          <span className="text-ink">
            {q ? `Tìm kiếm: "${q}"` : 'Tìm kiếm'}
          </span>
        </nav>

        <ProductBrowser
          products={results}
          topSlot={
            <div className="card p-4 mb-3">
              <form
                action="/search"
                className="flex items-center h-11 rounded border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
              >
                <SearchIcon className="w-5 h-5 text-ink-subtle ml-3" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Tìm sản phẩm…"
                  className="flex-1 bg-transparent border-0 outline-none px-3 text-sm"
                  aria-label="Từ khóa tìm kiếm"
                />
                <button
                  type="submit"
                  className="bg-primary text-white h-full px-5 font-medium hover:bg-primary-600 transition-colors"
                >
                  Tìm
                </button>
              </form>
              {!q && (
                <div className="mt-3">
                  <div className="text-xs font-medium mb-2 text-ink-muted">
                    Tìm kiếm phổ biến
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR.map((kw) => (
                      <Link
                        key={kw}
                        href={`/search?q=${encodeURIComponent(kw)}`}
                        className="chip cursor-pointer hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        {kw}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          }
          resultLabel={
            q ? (
              <>
                Kết quả cho{' '}
                <span className="font-semibold text-ink">“{q}”</span> ·{' '}
                <span className="font-semibold text-ink">
                  {results.length}
                </span>{' '}
                sản phẩm
              </>
            ) : null
          }
          emptyState={
            <div className="card p-10 text-center">
              <div className="text-lg font-semibold mb-1">
                Không tìm thấy sản phẩm
              </div>
              <p className="text-sm text-ink-muted">
                Hãy thử từ khóa khác hoặc kiểm tra lỗi chính tả.
              </p>
            </div>
          }
          showPagination={results.length > 0}
        />
      </div>
    </MainShell>
  );
}
