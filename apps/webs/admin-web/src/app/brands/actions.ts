'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { revalidatePath } from 'next/cache';
import {
  createBrand,
  deleteBrand,
  getBrandById,
  updateBrand,
} from '../../lib/admin-catalog';
import { base64DataUrlToBuffer } from '../../lib/image-base64';
import { createPresignedUrl, imageMimeTypeToExtension } from '../../lib/media';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Thao tác brand thất bại.';
}

async function uploadBrandLogo(logoBase64?: string): Promise<string | null> {
  if (!logoBase64) return null;

  const { mimeType, buffer } = base64DataUrlToBuffer(logoBase64);
  const extension = imageMimeTypeToExtension(mimeType);
  const fileName = `brand-logo-${Date.now()}.${extension}`;

  const { presignedUrl, url } = await createPresignedUrl({
    fileName,
    type: ImageTypeValues.BRAND,
  });

  const putRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
    },
    body: new Blob([buffer], { type: mimeType }),
  });

  if (!putRes.ok) {
    throw new Error('Tải logo brand thất bại.');
  }

  return url;
}

export async function createBrandAction(input: {
  name: string;
  logo?: string;
  logoBase64?: string;
}) {
  try {
    const uploadedLogo = await uploadBrandLogo(input.logoBase64);
    await createBrand({
      name: input.name.trim(),
      logo: uploadedLogo ?? (input.logo?.trim() ? input.logo.trim() : null),
    });
    revalidatePath('/brands');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function getBrandByIdAction(id: string) {
  try {
    const brand = await getBrandById(id);
    if (!brand) return { ok: false, message: 'Không tìm thấy brand.' };
    return { ok: true, data: brand };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function updateBrandAction(input: {
  id: string;
  name?: string;
  logo?: string;
  logoBase64?: string;
}) {
  try {
    const uploadedLogo = await uploadBrandLogo(input.logoBase64);
    await updateBrand({
      id: input.id,
      name: input.name?.trim(),
      logo: uploadedLogo ?? (input.logo?.trim() ? input.logo.trim() : null),
    });
    revalidatePath('/brands');
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
