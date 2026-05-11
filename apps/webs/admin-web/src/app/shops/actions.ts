'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { revalidatePath } from 'next/cache';
import { updateShop } from '../../lib/admin-shop-wallet';
import { base64DataUrlToBuffer } from '../../lib/image-base64';
import {
  buildShopBannerFileName,
  buildShopLogoFileName,
  createPresignedUrl,
} from '../../lib/media';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Cập nhật shop thất bại.';
}

async function uploadShopImage(
  imageBase64: string | undefined,
  fileNameBuilder: (mimeType: string) => string,
): Promise<string | undefined> {
  if (!imageBase64) return undefined;

  const { mimeType, buffer } = base64DataUrlToBuffer(imageBase64);
  const fileName = fileNameBuilder(mimeType);
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
    throw new Error('Tải ảnh shop thất bại.');
  }

  return url;
}

export async function updateShopAction(input: {
  id: string;
  merchantId?: string;
  name?: string;
  description?: string;
  status?: string;
  logo?: string;
  banner?: string;
  logoBase64?: string;
  bannerBase64?: string;
  phone?: string;
  pickupAddress?: string;
  returnAddress?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  bankAccountName?: string;
}) {
  try {
    const { logoBase64, bannerBase64, ...rest } = input;
    const [uploadedLogo, uploadedBanner] = await Promise.all([
      uploadShopImage(logoBase64, buildShopLogoFileName),
      uploadShopImage(bannerBase64, buildShopBannerFileName),
    ]);

    await updateShop({
      ...rest,
      logo: uploadedLogo ?? input.logo ?? null,
      banner: uploadedBanner ?? input.banner ?? null,
      phone: input.phone ?? null,
      pickupAddress: input.pickupAddress ?? null,
      returnAddress: input.returnAddress ?? null,
      bankName: input.bankName ?? null,
      bankAccountNumber: input.bankAccountNumber ?? null,
      bankCode: input.bankCode ?? null,
      bankAccountName: input.bankAccountName ?? null,
    });
    revalidatePath('/shops');
    revalidatePath(`/shops/${input.id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
