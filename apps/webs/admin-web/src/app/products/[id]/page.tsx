import { Star } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Pagination } from '../../../components/Pagination';
import {
  getCategoriesByParent,
  getManyBrands,
  getSellerProductById,
} from '../../../lib/catalog';
import { getDistricts, getProvinces, getWards } from '../../../lib/location';
import { getManyReviews } from '../../../lib/review';
import {
  ProductForm,
  type ProductFormInitial,
} from '../_components/ProductForm';

export const metadata = { title: 'Chi tiết sản phẩm — V-Shop Admin' };

function parsePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function buildReviewHref(id: string, page: number): string {
  const sp = new URLSearchParams();
  if (page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `/products/${id}?${qs}` : `/products/${id}`;
}

function formatDate(raw: unknown): string {
  if (!raw) return '';
  const d = raw instanceof Date ? raw : new Date(String(raw));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
}

export default async function ProductDetailPage({
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

  const product = await getSellerProductById(id);
  if (!product) notFound();

  // Suy diễn parent category từ product.categories để pre-fetch children.
  const initialParentCategoryId =
    product.categories?.find((c) => !c.parentCategoryId)?.id ??
    product.categories?.[0]?.id ??
    '';

  const [
    reviewsData,
    brands,
    rootCategories,
    provinces,
    initialChildCategories,
    initialDistricts,
    initialWards,
  ] = await Promise.all([
    getManyReviews({
      productId: product.id,
      page: reviewPage,
      limit: reviewLimit,
    }),
    getManyBrands(),
    getCategoriesByParent(),
    getProvinces(),
    initialParentCategoryId
      ? getCategoriesByParent(initialParentCategoryId)
      : Promise.resolve([]),
    product.provinceId ? getDistricts(product.provinceId) : Promise.resolve([]),
    product.districtId ? getWards(product.districtId) : Promise.resolve([]),
  ]);

  const reviewTotalPages = Math.max(reviewsData.totalPages || 1, 1);

  // Map ProductResponse → ProductFormInitial
  const initial: ProductFormInitial = {
    id: product.id,
    shopId: product.shopId ?? '',
    name: product.name,
    description: product.description ?? '',
    basePrice: product.basePrice ?? 0,
    virtualPrice: product.virtualPrice ?? 0,
    status: product.status,
    brandId: product.brandId ?? '',
    sizeGuide: product.sizeGuide ?? '',
    images: product.images ?? [],
    variants: product.variants ?? [],
    skus: (product.skus ?? []).map((s) => ({
      value: s.value,
      price: s.price,
      stock: s.stock,
      image: s.image ?? '',
    })),
    attributes: product.attributes ?? [],
    categories: (product.categories ?? []).map((c) => c.id),
    categoryRefs: (product.categories ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      parentCategoryId: c.parentCategoryId ?? null,
    })),
    provinceId: product.provinceId,
    provinceName: product.provinceName,
    districtId: product.districtId,
    districtName: product.districtName,
    wardId: product.wardId,
    wardName: product.wardName,
  };

  return (
    <div className="space-y-6">
      <ProductForm
        mode="edit"
        initial={initial}
        brands={brands}
        rootCategories={rootCategories}
        provinces={provinces}
        initialChildCategories={initialChildCategories}
        initialDistricts={initialDistricts}
        initialWards={initialWards}
      />

      {/* Reviews */}
      <section className="max-w-5xl mx-auto card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">
            Đánh giá sản phẩm
            <span className="text-ink-muted text-sm font-normal ml-2">
              ({reviewsData.totalItems} lượt)
            </span>
          </h2>
        </div>

        {reviewsData.reviews.length === 0 ? (
          <p className="text-sm text-ink-muted italic py-6 text-center">
            Sản phẩm chưa có đánh giá nào.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reviewsData.reviews.map((r) => (
              <li key={r.id} className="py-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < r.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-ink">
                      {r.rating}/5
                    </span>
                  </div>
                  <time
                    className="text-xs text-ink-subtle"
                    dateTime={String(r.createdAt)}
                  >
                    {formatDate(r.createdAt)}
                  </time>
                </div>
                {r.content && (
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                    {r.content}
                  </p>
                )}
                {r.mediaUrls?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {r.mediaUrls.map((url, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={`${url}-${i}`}
                        src={url}
                        alt=""
                        className="w-16 h-16 rounded object-cover border border-slate-200"
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs text-ink-subtle">
                  User ID:{' '}
                  <span className="font-mono">{r.userId.slice(0, 8)}…</span>
                </p>
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={reviewPage}
          totalPages={reviewTotalPages}
          buildHref={(n) => buildReviewHref(product.id, n)}
          ariaLabel="Phân trang đánh giá"
        />
      </section>
    </div>
  );
}
