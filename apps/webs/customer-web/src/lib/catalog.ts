import type { OrderBy, SortBy } from '@common/constants/product.constant';
import type {
  GetManyCategoriesResponse,
  GetManyProductsResponse,
  GetProductResponse,
} from '@common/interfaces/models/catalog';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import { formatCount } from '@common/web-core/lib/format';
import { cache } from 'react';
import type { Product } from '../components/ProductCard';
import { createServerApi } from './api';

export type ProductListItem = GetManyProductsResponse['products'][number];
export type CategoryItem = GetManyCategoriesResponse['categories'][number];

// Map sản phẩm từ API sang shape của ProductCard.
export function toCardProduct(p: ProductListItem): Product {
  const hasOld =
    typeof p.virtualPrice === 'number' && p.virtualPrice > p.basePrice;
  const discount = hasOld
    ? Math.round(((p.virtualPrice - p.basePrice) / p.virtualPrice) * 100)
    : undefined;
  return {
    id: p.id,
    name: p.name,
    price: p.basePrice,
    oldPrice: hasOld ? p.virtualPrice : undefined,
    discount,
    rating:
      typeof p.averageRate === 'number' && p.averageRate > 0
        ? p.averageRate
        : undefined,
    sold:
      typeof p.soldCount === 'number' && p.soldCount > 0
        ? formatCount(p.soldCount)
        : undefined,
    image: p.images?.[0] ?? '/placeholder.png',
  };
}

const EMPTY_PRODUCTS: GetManyProductsResponse = {
  page: 1,
  limit: 12,
  totalItems: 0,
  totalPages: 0,
  products: [],
};

export type GetProductsQuery = {
  name?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
  orderBy?: OrderBy;
  page?: number;
  limit?: number;
  shopId?: string;
};

export async function getManyProducts(
  q: GetProductsQuery = {},
): Promise<GetManyProductsResponse> {
  const api = await createServerApi();
  const params: Record<string, unknown> = {
    page: q.page ?? 1,
    limit: q.limit ?? 12,
    sortBy: q.sortBy ?? 'createdAt',
    orderBy: q.orderBy ?? 'desc',
  };
  if (q.name) params.name = q.name;
  if (q.categories?.length) params.categories = q.categories;
  if (typeof q.minPrice === 'number' && q.minPrice > 0)
    params.minPrice = q.minPrice;
  if (typeof q.maxPrice === 'number' && q.maxPrice > 0)
    params.maxPrice = q.maxPrice;
  if (q.shopId) params.shopId = q.shopId;

  const res = await api.get<ApiResponse<GetManyProductsResponse>>(
    '/catalog/product',
    {
      params,
      paramsSerializer: {
        indexes: null,
      },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return EMPTY_PRODUCTS;
  return res.data?.data ?? EMPTY_PRODUCTS;
}

// Lấy chi tiết 1 product. Trả về null nếu BFF trả 404.
export const getProductById = cache(
  async (id: string): Promise<GetProductResponse | null> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<GetProductResponse>>(
      `/catalog/product/${id}`,
      { validateStatus: (s) => (s >= 200 && s < 300) || s === 404 },
    );
    if (res.status === 404) return null;
    return res.data?.data ?? null;
  },
);

// Lấy danh mục cha (parentCategoryId IS NULL) — backend mặc định trả root khi
// không truyền parentCategoryId. Endpoint này không phân trang, trả tất cả.
export const getRootCategories = cache(async (): Promise<CategoryItem[]> => {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyCategoriesResponse>>(
    '/catalog/category',
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return [];
  return res.data?.data?.categories ?? [];
});
