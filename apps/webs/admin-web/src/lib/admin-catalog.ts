import type {
  AttributeResponse,
  BrandResponse,
  CategoryResponse,
  GetManyAttributesResponse,
  GetManyBrandsResponse,
  GetManyCategoriesResponse,
} from '@common/interfaces/models/catalog';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import { createServerApi } from './api';

export type CategoryListItem = GetManyCategoriesResponse['categories'][number];

export async function getManyCategories(
  parentCategoryId?: string,
): Promise<CategoryListItem[]> {
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

export async function getCategoryById(
  id: string,
): Promise<CategoryResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<CategoryResponse>>(
    `/catalog/category/${id}`,
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function createCategory(payload: {
  name: string;
  logo?: string | null;
  parentCategoryId?: string | null;
}): Promise<CategoryResponse> {
  const api = await createServerApi();
  const body: {
    name: string;
    logo?: string | null;
    parentCategoryId?: string | null;
  } = {
    name: payload.name,
  };

  if (payload.logo !== undefined) {
    body.logo = payload.logo;
  }
  if (payload.parentCategoryId !== undefined) {
    body.parentCategoryId = payload.parentCategoryId;
  }

  const { data } = await api.post<ApiResponse<CategoryResponse>>(
    '/catalog/category',
    body,
  );
  if (!data?.data) throw new Error('Tạo category thất bại.');
  return data.data;
}

export async function updateCategory(payload: {
  id: string;
  name?: string;
  logo?: string | null;
  parentCategoryId?: string | null;
}): Promise<CategoryResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<CategoryResponse>>(
    '/catalog/category',
    payload,
  );
  if (!data?.data) throw new Error('Cập nhật category thất bại.');
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  const api = await createServerApi();
  await api.delete(`/catalog/category/${id}`);
}

export async function getManyBrands(
  query: {
    page?: number;
    limit?: number;
    name?: string;
  } = {},
): Promise<GetManyBrandsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyBrandsResponse>>(
    '/catalog/brand',
    {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        ...(query.name ? { name: query.name } : {}),
      },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      brands: [],
    };
  }

  return (
    res.data?.data ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      brands: [],
    }
  );
}

export async function getBrandById(id: string): Promise<BrandResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<BrandResponse>>(
    `/catalog/brand/${id}`,
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function createBrand(payload: {
  name: string;
  logo?: string | null;
}): Promise<BrandResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<BrandResponse>>(
    '/catalog/brand',
    {
      name: payload.name,
      logo: payload.logo ?? null,
    },
  );
  if (!data?.data) throw new Error('Tạo brand thất bại.');
  return data.data;
}

export async function updateBrand(payload: {
  id: string;
  name?: string;
  logo?: string | null;
}): Promise<BrandResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<BrandResponse>>(
    '/catalog/brand',
    payload,
  );
  if (!data?.data) throw new Error('Cập nhật brand thất bại.');
  return data.data;
}

export async function deleteBrand(id: string): Promise<void> {
  const api = await createServerApi();
  await api.delete(`/catalog/brand/${id}`);
}

export async function getManyAttributes(
  query: {
    page?: number;
    limit?: number;
    name?: string;
  } = {},
): Promise<GetManyAttributesResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyAttributesResponse>>(
    '/catalog/attribute',
    {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        ...(query.name ? { name: query.name } : {}),
      },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      attributes: [],
    };
  }

  return (
    res.data?.data ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      attributes: [],
    }
  );
}

export async function getAttributeById(
  id: string,
): Promise<AttributeResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<AttributeResponse>>(
    `/catalog/attribute/${id}`,
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function createAttribute(payload: {
  name: string;
  url?: string;
}): Promise<AttributeResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<AttributeResponse>>(
    '/catalog/attribute',
    payload,
  );
  if (!data?.data) throw new Error('Tạo attribute thất bại.');
  return data.data;
}

export async function updateAttribute(payload: {
  id: string;
  name?: string;
  url?: string;
}): Promise<AttributeResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<AttributeResponse>>(
    '/catalog/attribute',
    payload,
  );
  if (!data?.data) throw new Error('Cập nhật attribute thất bại.');
  return data.data;
}

export async function deleteAttribute(id: string): Promise<void> {
  const api = await createServerApi();
  await api.delete(`/catalog/attribute/${id}`);
}
