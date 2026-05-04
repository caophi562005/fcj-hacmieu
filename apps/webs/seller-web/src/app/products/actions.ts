'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createSellerProduct,
  deleteSellerProduct,
  updateSellerProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../../lib/catalog';

export type ProductMutationResult = {
  ok: boolean;
  message?: string;
  id?: string;
};

function extractErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  const m = data?.message;
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'string') return m;
  return 'Đã xảy ra lỗi, vui lòng thử lại.';
}

export async function createProductAction(
  payload: CreateProductPayload,
): Promise<ProductMutationResult> {
  try {
    const product = await createSellerProduct(payload);
    revalidatePath('/products');
    return { ok: true, id: product.id };
  } catch (err) {
    console.error('[createProductAction]', err);
    return { ok: false, message: extractErrorMessage(err) };
  }
}

export async function updateProductAction(
  id: string,
  payload: UpdateProductPayload,
): Promise<ProductMutationResult> {
  try {
    await updateSellerProduct(id, payload);
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    return { ok: true, id };
  } catch (err) {
    console.error('[updateProductAction]', err);
    return { ok: false, message: extractErrorMessage(err) };
  }
}

export async function deleteProductAction(id: string): Promise<void> {
  try {
    await deleteSellerProduct(id);
  } catch (err) {
    console.error('[deleteProductAction]', err);
    // Ném lỗi ra client — xử lý tại form
    throw new Error(extractErrorMessage(err));
  }
  revalidatePath('/products');
  redirect('/products');
}
