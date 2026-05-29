'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { base64DataUrlToBuffer } from '@common/web-core/lib/image-base64';
import { revalidatePath } from 'next/cache';
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
import { cookies } from 'next/headers';
import { AppConfiguration } from '@common/configurations/app.config';
import { ACCESS_TOKEN_COOKIE } from '../../lib/auth';

type RefreshResponse = {
  data?: {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
};

async function forceRefreshToken() {
  const c = await cookies();
  const refreshToken = c.get('refresh_token')?.value;
  if (!refreshToken) return;

  try {
    const BFF_BASE_URL = AppConfiguration.SELLER_BFF_URL;
    const r = await fetch(`${BFF_BASE_URL}/iam/auth/refresh`, {
      method: 'POST',
      headers: {
        'x-refresh-token': refreshToken,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!r.ok) return;
    const body = (await r.json()) as RefreshResponse;
    const data = body?.data;
    if (!data?.accessToken) return;

    const expiresIn = data.expiresIn ?? 3600;
    const isProd = process.env.NODE_ENV === 'production';

    c.set(ACCESS_TOKEN_COOKIE, data.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
      secure: isProd,
    });

    if (data.idToken) {
      c.set('id_token', data.idToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn,
        secure: isProd,
      });
    }

    if (data.refreshToken) {
      c.set('refresh_token', data.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        secure: isProd,
      });
    }
  } catch (err) {
    console.error('[forceRefreshToken] Failed to refresh token:', err);
  }
}

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
    
    // Đợi một chút để Cognito sync attribute, sau đó force refresh token
    await new Promise((resolve) => setTimeout(resolve, 500));
    await forceRefreshToken();
    
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
