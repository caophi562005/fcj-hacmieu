'use server';

import { GenderEnums } from '@common/constants/user.constant';
import { revalidatePath } from 'next/cache';
import {
  updateCurrentUser,
  type UpdateCurrentUserPayload,
} from '../../lib/iam';

export type UpdateProfileState = {
  ok: boolean;
  message: string;
};

export async function updateProfileAction(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  // Pull values; only the 3 editable fields per skill guidance.
  const phoneRaw = formData.get('phoneNumber');
  const genderRaw = formData.get('gender');
  const birthdayRaw = formData.get('birthday');

  const payload: UpdateCurrentUserPayload = {};

  if (typeof phoneRaw === 'string' && phoneRaw.trim() !== '') {
    payload.phoneNumber = phoneRaw.trim();
  }

  if (typeof genderRaw === 'string') {
    const parsed = GenderEnums.safeParse(genderRaw);
    if (parsed.success) payload.gender = parsed.data;
  }

  if (typeof birthdayRaw === 'string' && birthdayRaw !== '') {
    // Backend `birthday` is z.any().nullable(); send ISO string for consistency.
    payload.birthday = new Date(birthdayRaw).toISOString();
  }

  if (Object.keys(payload).length === 0) {
    return { ok: false, message: 'Không có thay đổi nào để lưu.' };
  }

  try {
    await updateCurrentUser(payload);
    revalidatePath('/profile');
    return { ok: true, message: 'Cập nhật hồ sơ thành công.' };
  } catch (err) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.';
    return { ok: false, message: msg };
  }
}
