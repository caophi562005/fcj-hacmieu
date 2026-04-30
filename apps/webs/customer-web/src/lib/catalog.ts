import type { OrderBy, SortBy } from '@common/constants/product.constant';
import type {
  GetManyCategoriesResponse,
  GetManyProductsResponse,
} from '@common/interfaces/models/catalog';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import { cache } from 'react';
import { createServerApi } from './api';

export type ProductListItem = GetManyProductsResponse['products'][number];
export type CategoryItem = GetManyCategoriesResponse['categories'][number];

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

  const res = await api.get<ApiResponse<GetManyProductsResponse>>(
    '/catalog/product',
    {
      params,
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return EMPTY_PRODUCTS;
  return res.data?.data ?? EMPTY_PRODUCTS;
}

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
