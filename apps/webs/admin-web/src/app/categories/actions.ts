'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { revalidatePath } from 'next/cache';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '../../lib/admin-catalog';
import { base64DataUrlToBuffer } from '../../lib/image-base64';
import { createPresignedUrl, imageMimeTypeToExtension } from '../../lib/media';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Thao tác category thất bại.';
}

async function uploadCategoryLogo(logoBase64?: string): Promise<string | null> {
  if (!logoBase64) return null;

  const { mimeType, buffer } = base64DataUrlToBuffer(logoBase64);
  const extension = imageMimeTypeToExtension(mimeType);
  const fileName = `category-logo-${Date.now()}.${extension}`;

  const { presignedUrl, url } = await createPresignedUrl({
    fileName,
    type: ImageTypeValues.OTHER,
  });

  const putRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
    },
    body: new Blob([buffer], { type: mimeType }),
  });

  if (!putRes.ok) {
    throw new Error('Tải logo category thất bại.');
  }

  return url;
}

export async function createCategoryAction(input: {
  name: string;
  logo?: string;
  logoBase64?: string;
  parentCategoryId?: string;
}) {
  try {
    const uploadedLogo = await uploadCategoryLogo(input.logoBase64);
    const logo =
      uploadedLogo ?? (input.logo?.trim() ? input.logo.trim() : null);
    const parentCategoryId = input.parentCategoryId?.trim();

    await createCategory({
      name: input.name.trim(),
      logo,
      ...(parentCategoryId ? { parentCategoryId } : {}),
    });
    revalidatePath('/categories');
    if (parentCategoryId) {
      revalidatePath(`/categories/${parentCategoryId}`);
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function updateCategoryAction(input: {
  id: string;
  name?: string;
  logo?: string;
  logoBase64?: string;
  parentCategoryId?: string;
}) {
  try {
    const uploadedLogo = await uploadCategoryLogo(input.logoBase64);
    const logo =
      uploadedLogo ?? (input.logo?.trim() ? input.logo.trim() : null);

    await updateCategory({
      id: input.id,
      name: input.name?.trim(),
      logo,
      parentCategoryId: input.parentCategoryId?.trim() || null,
    });
    revalidatePath('/categories');
    revalidatePath(`/categories/${input.id}`);
    if (input.parentCategoryId?.trim()) {
      revalidatePath(`/categories/${input.parentCategoryId.trim()}`);
    }
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
