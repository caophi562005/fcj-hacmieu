'use server';

import { revalidatePath } from 'next/cache';
import {
  createAttribute,
  deleteAttribute,
  getAttributeById,
  updateAttribute,
} from '../../lib/admin-catalog';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Thao tác attribute thất bại.';
}

export async function createAttributeAction(input: {
  name: string;
  url?: string;
}) {
  try {
    await createAttribute({
      name: input.name.trim(),
      url: input.url?.trim() || undefined,
    });
    revalidatePath('/attributes');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function getAttributeByIdAction(id: string) {
  try {
    const attribute = await getAttributeById(id);
    if (!attribute) return { ok: false, message: 'Không tìm thấy attribute.' };
    return { ok: true, data: attribute };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function updateAttributeAction(input: {
  id: string;
  name?: string;
  url?: string;
}) {
  try {
    await updateAttribute({
      id: input.id,
      name: input.name?.trim(),
      url: input.url?.trim() || undefined,
    });
    revalidatePath('/attributes');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function deleteAttributeAction(id: string) {
  try {
    await deleteAttribute(id);
    revalidatePath('/attributes');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
