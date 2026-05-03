'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../../../../lib/iam';
import { createMyReview } from '../../../../lib/review';

export type CreateReviewState = {
  ok: boolean;
  message: string;
};

export async function createReviewAction(
  _prev: CreateReviewState,
  formData: FormData,
): Promise<CreateReviewState> {
  const orderId = String(formData.get('orderId') ?? '');
  const orderItemId = String(formData.get('orderItemId') ?? '');
  const sellerId = String(formData.get('sellerId') ?? '');
  const productId = String(formData.get('productId') ?? '');
  const content = String(formData.get('content') ?? '').trim();
  const ratingRaw = Number(formData.get('rating') ?? 0);
  const rating = Number.isInteger(ratingRaw) ? ratingRaw : 0;

  if (!orderId || !orderItemId || !sellerId || !productId) {
    return { ok: false, message: 'Thiếu thông tin để gửi đánh giá.' };
  }

  if (rating < 1 || rating > 5) {
    return { ok: false, message: 'Vui lòng chọn số sao từ 1 đến 5.' };
  }

  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { ok: false, message: 'Bạn cần đăng nhập để đánh giá.' };
    }

    await createMyReview({
      userId: user.id,
      sellerId,
      productId,
      orderId,
      orderItemId,
      rating,
      content: content || undefined,
      mediaUrls: [],
    });

    revalidatePath(`/profile/orders/${orderId}`);
    return { ok: true, message: 'Đánh giá thành công.' };
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const apiMessage = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;

    if (status === 409 || apiMessage === 'Error.ReviewAlreadyExists') {
      return { ok: false, message: 'Bạn đã đánh giá sản phẩm này rồi.' };
    }

    return { ok: false, message: 'Không thể gửi đánh giá. Vui lòng thử lại.' };
  }
}
