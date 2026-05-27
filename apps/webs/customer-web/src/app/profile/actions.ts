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
  const phoneRaw = formData.get('phoneNumber');
  const genderRaw = formData.get('gender');
  const birthdayRaw = formData.get('birthday');
  
  const provinceIdRaw = formData.get('provinceId');
  const provinceNameRaw = formData.get('provinceName');
  const districtIdRaw = formData.get('districtId');
  const districtNameRaw = formData.get('districtName');
  const wardIdRaw = formData.get('wardId');
  const wardNameRaw = formData.get('wardName');
  const addressRaw = formData.get('address');

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

  if (typeof provinceIdRaw === 'string' && provinceIdRaw !== '') {
    payload.provinceId = Number(provinceIdRaw);
    if (typeof provinceNameRaw === 'string') {
      payload.provinceName = provinceNameRaw;
    }
  }

  if (typeof districtIdRaw === 'string' && districtIdRaw !== '') {
    payload.districtId = Number(districtIdRaw);
    if (typeof districtNameRaw === 'string') {
      payload.districtName = districtNameRaw;
    }
  }

  if (typeof wardIdRaw === 'string' && wardIdRaw !== '') {
    payload.wardId = Number(wardIdRaw);
    if (typeof wardNameRaw === 'string') {
      payload.wardName = wardNameRaw;
    }
  }

  if (typeof addressRaw === 'string') {
    payload.address = addressRaw.trim();
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
