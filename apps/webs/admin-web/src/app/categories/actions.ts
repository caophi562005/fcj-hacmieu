'use server';

import { revalidatePath } from 'next/cache';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '../../lib/admin-catalog';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Thao tác category thất bại.';
}

export async function createCategoryAction(input: {
  name: string;
  logo?: string;
  parentCategoryId?: string;
}) {
  try {
    await createCategory({
      name: input.name,
      logo: input.logo || null,
      parentCategoryId: input.parentCategoryId || null,
    });
    revalidatePath('/categories');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function updateCategoryAction(input: {
  id: string;
  name?: string;
  logo?: string;
  parentCategoryId?: string;
}) {
  try {
    await updateCategory({
      id: input.id,
      name: input.name,
      logo: input.logo ?? null,
      parentCategoryId: input.parentCategoryId ?? null,
    });
    revalidatePath('/categories');
    revalidatePath(`/categories/${input.id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await deleteCategory(id);
    revalidatePath('/categories');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
