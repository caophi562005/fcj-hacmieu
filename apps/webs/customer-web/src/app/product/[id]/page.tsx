import { Pagination, ReviewSummaryCard } from '@common/web-ui/index';
import { MessageCircle, Star, Store } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MainShell } from '../../../components/MainShell';
import { ProductCard } from '../../../components/ProductCard';
import { ProductInteractive } from '../../../components/ProductInteractive';
import {
  getManyProducts,
  getProductById,
  toCardProduct,
} from '../../../lib/catalog';
import { getManyReviews } from '../../../lib/review';
import { getReviewSummary } from '../../../lib/review-summary';
import { getShopById } from '../../../lib/shop';

// Format "Tham gia" từ createdAt (giống shop page).
function formatJoined(createdAt: string | Date): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'hôm nay';
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  const years = Math.floor(months / 12);
  return `${years} năm trước`;
}

function parsePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function buildReviewHref(page: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : '?';
}

export default async function ProductDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const reviewPage = parsePage(sp.page);
  const reviewLimit = 5;

  const product = await getProductById(id);
  if (!product) notFound();

  const [reviewsData, reviewSummary] = await Promise.all([
    getManyReviews({
      productId: product.id,
      page: reviewPage,
      limit: reviewLimit,
    }),
    getReviewSummary(product.id),
  ]);

  const shop = await getShopById(product.shopId);
  const relatedRes = await getManyProducts({
    shopId: product.shopId,
    limit: 6,
  });
  const related = relatedRes.products
    .filter((p) => p.id !== product.id)
    .slice(0, 6)
    .map(toCardProduct);
  const reviewTotalPages = Math.max(reviewsData.totalPages || 1, 1);

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

        <ProductInteractive
          productId={product.id}
          shopId={product.shopId}
          name={product.name}
          basePrice={product.basePrice}
          virtualPrice={product.virtualPrice}
          images={product.images ?? []}
          variants={product.variants ?? []}
          skus={product.skus ?? []}
          ratingCount={product.ratingCount}
          averageRate={product.averageRate}
          soldCount={product.soldCount}
        />

        {/* Shop info */}
        {shop && (
          <div className="card p-4 mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-full bg-primary-50 overflow-hidden flex items-center justify-center shrink-0">
                {shop.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-6 h-6 text-primary" aria-hidden />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold line-clamp-1">{shop.name}</div>
                <div className="text-xs text-ink-muted">
                  Tham gia {formatJoined(shop.createdAt)}
                  {shop.phone ? ` · ${shop.phone}` : ''}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/chat?to=${shop.userId}&name=${encodeURIComponent(shop.name)}&avatar=${encodeURIComponent(shop.logo ?? '')}`}
                className="btn-outline btn-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" /> Chat ngay
              </Link>
              <Link
                href={`/shop/${shop.id}`}
                className="btn-outline btn-sm cursor-pointer"
              >
                Xem shop
              </Link>
            </div>
          </div>
        )}

        {/* Attributes */}
        {product.attributes?.length ? (
          <div className="card p-5 mt-4">
            <h2 className="text-base font-semibold mb-3">Thông tin sản phẩm</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {product.attributes.map((a) => (
                <div key={a.name} className="flex">
                  <dt className="text-ink-muted w-32 shrink-0">{a.name}</dt>
                  <dd className="text-ink">{a.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {/* Description */}
        <div className="card p-5 mt-4">
          <h2 className="text-base font-semibold mb-3">Mô tả sản phẩm</h2>
          <div className="text-sm leading-relaxed text-ink-muted whitespace-pre-line">
            {product.description ||
              `${product.name} — sản phẩm chính hãng, chất lượng cao.`}
          </div>
          {product.sizeGuide ? (
            <div className="mt-4 border-t border-border-subtle pt-4">
              <h3 className="text-sm font-semibold mb-2">
                Hướng dẫn chọn size
              </h3>
              <pre className="text-sm text-ink-muted whitespace-pre-wrap font-sans">
                {product.sizeGuide}
              </pre>
            </div>
          ) : null}
        </div>

        {/* AI Review Summary */}
        {reviewSummary && <ReviewSummaryCard summary={reviewSummary} />}

        {/* Reviews */}
        <div className="card p-5 mt-4">
          <h2 className="text-base font-semibold mb-3">Đánh giá sản phẩm</h2>
          <div className="space-y-4">
            {reviewsData.reviews.length > 0 ? (
              reviewsData.reviews.map((review, idx) => {
                const rowIndex = (reviewPage - 1) * reviewLimit + idx + 1;
                const createdAtText = new Date(
                  review.createdAt,
                ).toLocaleDateString('vi-VN');

                return (
                  <div
                    key={review.id}
                    className="flex gap-3 pb-4 border-b border-border-subtle last:border-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.pravatar.cc/40?img=${((rowIndex - 1) % 70) + 1}`}
                      alt={`Avatar người dùng ${rowIndex}`}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          Người dùng {rowIndex}
                        </span>
                        <span className="flex items-center text-xs text-yellow-500">
                          {Array.from({ length: 5 }).map((_, k) => (
                            <Star
                              key={k}
                              className={`w-3 h-3 ${
                                k < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-border'
                              }`}
                            />
                          ))}
                        </span>
                        <span className="text-xs text-ink-subtle">
                          {createdAtText}
                        </span>
                      </div>
                      <p className="text-sm text-ink-muted mt-1 whitespace-pre-line">
                        {review.content || 'Không có nội dung đánh giá.'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-ink-muted">
                Sản phẩm chưa có đánh giá nào.
              </p>
            )}
          </div>

          <div className="mt-4">
            <Pagination
              page={reviewPage}
              totalPages={reviewTotalPages}
              buildHref={(n) => buildReviewHref(n)}
              ariaLabel="Phân trang đánh giá sản phẩm"
            />
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
