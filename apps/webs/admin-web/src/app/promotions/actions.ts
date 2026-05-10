'use server';

import { revalidatePath } from 'next/cache';
import {
  createPromotion,
  deletePromotion,
  getPromotionById,
  updatePromotion,
} from '../../lib/admin-promotion';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Thao tác promotion thất bại.';
}

export async function createPromotionAction(input: {
  code: string;
  name: string;
  description?: string;
  status: string;
  startsAt: string;
  endsAt: string;
  scope: string;
  minOrderSubtotal: number;
  discountType: string;
  discountValue: number;
  maxDiscount?: number;
  totalLimit: number;
}) {
  try {
    await createPromotion({
      ...input,
      description: input.description || null,
      maxDiscount: input.maxDiscount ?? null,
    });
    revalidatePath('/promotions');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function getPromotionByIdAction(id: string) {
  try {
    const promotion = await getPromotionById(id);
    if (!promotion)
      return { ok: false, message: 'Không tìm thấy chương trình.' };
    return { ok: true, data: promotion };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function updatePromotionAction(input: {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  scope?: string;
  minOrderSubtotal?: number;
  discountType?: string;
  discountValue?: number;
  maxDiscount?: number;
  totalLimit?: number;
}) {
  try {
    await updatePromotion({
      ...input,
      description: input.description ?? null,
      maxDiscount: input.maxDiscount ?? null,
    });
    revalidatePath('/promotions');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}

export async function deletePromotionAction(id: string) {
  try {
    await deletePromotion(id);
    revalidatePath('/promotions');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
