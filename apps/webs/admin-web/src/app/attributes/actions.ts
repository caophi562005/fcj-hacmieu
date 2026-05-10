'use server';

import { revalidatePath } from 'next/cache';
import {
  createAttribute,
  deleteAttribute,
  updateAttribute,
} from '../../lib/admin-catalog';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Thao tác attribute thất bại.';
}

export async function createAttributeAction(input: { name: string; url: string }) {
  try {
    await createAttribute(input);
    revalidatePath('/attributes');
    return { ok: true };
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
    await updateAttribute(input);
    revalidatePath('/attributes');
    revalidatePath(`/attributes/${input.id}`);
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
