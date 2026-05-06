'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { revalidatePath } from 'next/cache';
import { base64DataUrlToBuffer } from '../../lib/image-base64';
import {
  buildShopBannerFileName,
  buildShopLogoFileName,
  createPresignedUrl,
} from '../../lib/media';
import {
  createShop,
  updateShop,
  type CreateShopPayload,
  type UpdateShopPayload,
} from '../../lib/shop';

export type ShopMutationResult = {
  ok: boolean;
  message?: string;
  id?: string;
};

type ShopImageUploads = {
  /** base64 dataURL của logo mới (nếu user đổi). */
  logoBase64?: string;
  /** base64 dataURL của banner mới (nếu user đổi). */
  bannerBase64?: string;
};

function extractErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  const m = data?.message;
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'string') return m;
  return 'Đã xảy ra lỗi, vui lòng thử lại.';
}

async function uploadShopImage(
  base64DataUrl: string,
  kind: 'logo' | 'banner',
): Promise<string> {
  const { mimeType, buffer } = base64DataUrlToBuffer(base64DataUrl);
  const fileName =
    kind === 'logo'
      ? buildShopLogoFileName(mimeType)
      : buildShopBannerFileName(mimeType);

  // Banner dùng `BANNER`, logo coi như avatar (gần nghĩa nhất với "ảnh đại
  // diện" của shop trong domain ImageType hiện có).
  const type =
    kind === 'logo' ? ImageTypeValues.AVATAR : ImageTypeValues.BANNER;

  const { presignedUrl, url } = await createPresignedUrl({
    fileName,
    type,
  });

  const putRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: new Blob([buffer], { type: mimeType }),
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    console.error('[uploadShopImage] S3 PUT failed:', putRes.status, text);
    throw new Error(
      kind === 'logo'
        ? 'Tải logo lên S3 thất bại.'
        : 'Tải banner lên S3 thất bại.',
    );
  }

  return url;
}

export async function createShopAction(
  payload: CreateShopPayload,
  uploads?: ShopImageUploads,
): Promise<ShopMutationResult> {
  try {
    const [logoUrl, bannerUrl] = await Promise.all([
      uploads?.logoBase64
        ? uploadShopImage(uploads.logoBase64, 'logo')
        : Promise.resolve<string | null>(null),
      uploads?.bannerBase64
        ? uploadShopImage(uploads.bannerBase64, 'banner')
        : Promise.resolve<string | null>(null),
    ]);

    const shop = await createShop({
      ...payload,
      logo: logoUrl ?? payload.logo ?? null,
      banner: bannerUrl ?? payload.banner ?? null,
    });
    revalidatePath('/settings');
    return { ok: true, id: shop.id };
  } catch (err) {
    console.error('[createShopAction]', err);
    return { ok: false, message: extractErrorMessage(err) };
  }
}

export async function updateShopAction(
  payload: UpdateShopPayload,
  uploads?: ShopImageUploads,
): Promise<ShopMutationResult> {
  try {
    const [logoUrl, bannerUrl] = await Promise.all([
      uploads?.logoBase64
        ? uploadShopImage(uploads.logoBase64, 'logo')
        : Promise.resolve<string | null>(null),
      uploads?.bannerBase64
        ? uploadShopImage(uploads.bannerBase64, 'banner')
        : Promise.resolve<string | null>(null),
    ]);

    const shop = await updateShop({
      ...payload,
      // Chỉ override khi user upload ảnh mới; nếu không, giữ nguyên value
      // (có thể là URL cũ hoặc null nếu đã xoá).
      ...(logoUrl !== null ? { logo: logoUrl } : {}),
      ...(bannerUrl !== null ? { banner: bannerUrl } : {}),
    });
    revalidatePath('/settings');
    return { ok: true, id: shop.id };
  } catch (err) {
    console.error('[updateShopAction]', err);
    return { ok: false, message: extractErrorMessage(err) };
  }
}
