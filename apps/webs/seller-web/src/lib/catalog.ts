import type { ProductStatus } from '@common/constants/product.constant';
import type {
  CreateProductRequest,
  GetManyBrandsResponse,
  GetManyCategoriesResponse,
  GetManyProductsResponse,
  GetProductResponse,
  UpdateProductRequest,
} from '@common/interfaces/models/catalog';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import { createServerApi } from './api';

export type BrandOption = GetManyBrandsResponse['brands'][number];
export type CategoryOption = GetManyCategoriesResponse['categories'][number];

export async function getManyBrands(): Promise<BrandOption[]> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyBrandsResponse>>(
    '/catalog/brand',
    {
      params: { page: 1, limit: 200 },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return [];
  return res.data?.data?.brands ?? [];
}

export async function getCategoriesByParent(
  parentCategoryId?: string,
): Promise<CategoryOption[]> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyCategoriesResponse>>(
    '/catalog/category',
    {
      params: parentCategoryId ? { parentCategoryId } : {},
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return [];
  return res.data?.data?.categories ?? [];
}

export type ProductListItem = GetManyProductsResponse['products'][number];

const EMPTY_PRODUCTS: GetManyProductsResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  products: [],
};

export type GetProductsQuery = {
  page?: number;
  limit?: number;
  name?: string;
  status?: ProductStatus;
};

export async function getSellerProducts(
  q: GetProductsQuery = {},
): Promise<GetManyProductsResponse> {
  const api = await createServerApi();
  const params: Record<string, unknown> = {
    page: q.page ?? 1,
    limit: q.limit ?? 10,
    sortBy: 'createdAt',
    orderBy: 'desc',
  };
  if (q.name) params.name = q.name;
  if (q.status) params.status = q.status;

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

export async function getSellerProductById(
  id: string,
): Promise<GetProductResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetProductResponse>>(
    `/catalog/product/${id}`,
    { validateStatus: (s) => (s >= 200 && s < 300) || s === 404 },
  );
  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

// Seller-web không biết shopId / userId → điền placeholder (server inject trong
// BFF). CreateProductRequestSchema.shopId là z.string() (cho phép ''),
// createdById / updatedById là z.string().nullable().
export type CreateProductPayload = Omit<
  CreateProductRequest,
  'shopId' | 'createdById' | 'updatedById' | 'processId'
>;

export async function createSellerProduct(
  payload: CreateProductPayload,
): Promise<GetProductResponse> {
  const api = await createServerApi();
  const body = {
    ...payload,
    shopId: '',
    createdById: null,
    updatedById: null,
  };
  const { data } = await api.post<ApiResponse<GetProductResponse>>(
    '/catalog/product',
    body,
  );
  if (!data?.data) throw new Error('Create product failed');
  return data.data;
}

export type UpdateProductPayload = Omit<
  UpdateProductRequest,
  'id' | 'shopId' | 'createdById' | 'updatedById' | 'processId'
>;

export async function updateSellerProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<GetProductResponse> {
  const api = await createServerApi();
  const body = {
    ...payload,
    id,
    shopId: '',
    createdById: null,
    updatedById: null,
  };
  const { data } = await api.put<ApiResponse<GetProductResponse>>(
    `/catalog/product/${id}`,
    body,
  );
  if (!data?.data) throw new Error('Update product failed');
  return data.data;
}

export async function deleteSellerProduct(id: string): Promise<void> {
  const api = await createServerApi();
  await api.delete(`/catalog/product/${id}`);
}
