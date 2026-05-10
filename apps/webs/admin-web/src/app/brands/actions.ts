'use server';

import { revalidatePath } from 'next/cache';
import { createBrand, deleteBrand, updateBrand } from '../../lib/admin-catalog';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Thao tác brand thất bại.';
}

export async function createBrandAction(input: { name: string; logo?: string }) {
  try {
    await createBrand({ name: input.name, logo: input.logo || null });
    revalidatePath('/brands');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function updateBrandAction(input: { id: string; name?: string; logo?: string }) {
  try {
    await updateBrand({ id: input.id, name: input.name, logo: input.logo ?? null });
    revalidatePath('/brands');
    revalidatePath(`/brands/${input.id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    await deleteBrand(id);
    revalidatePath('/brands');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
