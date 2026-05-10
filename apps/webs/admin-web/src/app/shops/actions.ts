'use server';

import { revalidatePath } from 'next/cache';
import { updateShop } from '../../lib/admin-shop-wallet';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Cập nhật shop thất bại.';
}

export async function updateShopAction(input: {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  pickupAddress?: string;
  returnAddress?: string;
}) {
  try {
    await updateShop({
      ...input,
      logo: input.logo ?? null,
      banner: input.banner ?? null,
      phone: input.phone ?? null,
      pickupAddress: input.pickupAddress ?? null,
      returnAddress: input.returnAddress ?? null,
    });
    revalidatePath('/shops');
    revalidatePath(`/shops/${input.id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
