'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { base64DataUrlToBuffer } from '@common/web-core/lib/image-base64';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createSellerProduct,
  deleteSellerProduct,
  updateSellerProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../../lib/catalog';
import {
  buildProductImageFileName,
  buildSkuImageFileName,
  createPresignedUrl,
} from '../../lib/media';

export type ProductMutationResult = {
  ok: boolean;
  message?: string;
  id?: string;
};

type ProductImageUploadInput = {
  base64DataUrls: string[];
};

type SkuImageUploadInput = {
  skuIndex: number;
  skuValue: string;
  base64DataUrl: string;
};

function extractErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  const m = data?.message;
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'string') return m;
  return 'Đã xảy ra lỗi, vui lòng thử lại.';
}

async function uploadProductImages(
  input?: ProductImageUploadInput,
  productId?: string,
): Promise<string[] | null> {
  if (!input) return null;

  const { base64DataUrls } = input;
  if (base64DataUrls.length === 0) return [];

  const uploadedUrls = await Promise.all(
    base64DataUrls.map(async (base64DataUrl, index) => {
      const { mimeType, buffer } = base64DataUrlToBuffer(base64DataUrl);
      const fileName = buildProductImageFileName(index, mimeType);

      const { presignedUrl, url } = await createPresignedUrl({
        fileName,
        type: ImageTypeValues.PRODUCT,
        ...(productId ? { productId } : {}),
      });

      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
        },
        body: new Blob([buffer], { type: mimeType }),
      });

      if (!putRes.ok) {
        const text = await putRes.text();
        console.error(
          '[uploadProductImages] S3 PUT failed:',
          putRes.status,
          text,
        );
        throw new Error('Tải ảnh sản phẩm lên S3 thất bại.');
      }

      return url;
    }),
  );

  return uploadedUrls;
}

async function uploadSkuImages(
  skus: NonNullable<CreateProductPayload['skus']>,
  uploads?: SkuImageUploadInput[],
  productId?: string,
): Promise<NonNullable<CreateProductPayload['skus']>> {
  if (!uploads || uploads.length === 0) return skus;

  const nextSkus = skus.map((sku) => ({ ...sku }));

  await Promise.all(
    uploads.map(async ({ skuIndex, skuValue, base64DataUrl }) => {
      if (skuIndex < 0 || skuIndex >= nextSkus.length) return;

      const { mimeType, buffer } = base64DataUrlToBuffer(base64DataUrl);
      const fileName = buildSkuImageFileName(skuValue, skuIndex, mimeType);

      const { presignedUrl, url } = await createPresignedUrl({
        fileName,
        type: ImageTypeValues.PRODUCT,
        ...(productId ? { productId } : {}),
      });

      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
        },
        body: new Blob([buffer], { type: mimeType }),
      });

      if (!putRes.ok) {
        const text = await putRes.text();
        console.error('[uploadSkuImages] S3 PUT failed:', putRes.status, text);
        throw new Error('Tải ảnh SKU lên S3 thất bại.');
      }

      nextSkus[skuIndex] = {
        ...nextSkus[skuIndex],
        image: url,
      };
    }),
  );

  return nextSkus;
}

export async function createProductAction(
  payload: CreateProductPayload,
  imageUploadInput?: ProductImageUploadInput,
  skuImageUploadInput?: SkuImageUploadInput[],
): Promise<ProductMutationResult> {
  let createdProductId: string | null = null;

  try {
    const product = await createSellerProduct(payload);
    createdProductId = product.id;

    const hasNewProductImages =
      (imageUploadInput?.base64DataUrls.length ?? 0) > 0;
    const hasNewSkuImages = (skuImageUploadInput?.length ?? 0) > 0;

    if (hasNewProductImages || hasNewSkuImages) {
      const uploadedImages = await uploadProductImages(
        imageUploadInput,
        product.id,
      );
      const uploadedSkus = await uploadSkuImages(
        payload.skus,
        skuImageUploadInput,
        product.id,
      );

      await updateSellerProduct(product.id, {
        ...payload,
        images: uploadedImages
          ? [...payload.images, ...uploadedImages]
          : payload.images,
        skus: uploadedSkus,
      });
    }

    revalidatePath('/products');
    return { ok: true, id: product.id };
  } catch (err) {
    console.error('[createProductAction]', err);

    if (createdProductId) {
      try {
        await deleteSellerProduct(createdProductId);
      } catch (cleanupErr) {
        console.error(
          '[createProductAction] rollback delete failed:',
          cleanupErr,
        );
      }
    }

    return { ok: false, message: extractErrorMessage(err) };
  }
}

export async function updateProductAction(
  id: string,
  payload: UpdateProductPayload,
  imageUploadInput?: ProductImageUploadInput,
  skuImageUploadInput?: SkuImageUploadInput[],
): Promise<ProductMutationResult> {
  try {
    const uploadedImages = await uploadProductImages(imageUploadInput, id);
    const uploadedSkus = await uploadSkuImages(
      payload.skus,
      skuImageUploadInput,
      id,
    );

    await updateSellerProduct(id, {
      ...payload,
      images: uploadedImages
        ? [...payload.images, ...uploadedImages]
        : payload.images,
      skus: uploadedSkus,
    });
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
