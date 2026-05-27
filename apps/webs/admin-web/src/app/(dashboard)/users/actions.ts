'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { base64DataUrlToBuffer } from '@common/web-core/lib/image-base64';
import { revalidatePath } from 'next/cache';
import { updateUserById } from '../../../lib/admin-iam';
import { buildShopLogoFileName, createPresignedUrl } from '../../../lib/media';

const GROUP_OPTIONS = ['CUSTOMER', 'SELLER', 'ADMIN'] as const;

function normalizeBirthdayToIsoDateTime(birthday?: string): string | undefined {
  const value = birthday?.trim();
  if (!value) return undefined;

  if (value.includes('T')) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return date.toISOString();
}

export async function updateUserAction(input: {
  id: string;
  phoneNumber?: string;
  avatarBase64?: string;
  gender?: string;
  birthday?: string;
  group?: string[];
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  wardId?: number;
  wardName?: string;
  address?: string;
}) {
  try {
    const gender = ['MALE', 'FEMALE', 'OTHER'].includes(input.gender ?? '')
      ? (input.gender as 'MALE' | 'FEMALE' | 'OTHER')
      : undefined;

    const group = (input.group ?? []).filter(
      (item): item is (typeof GROUP_OPTIONS)[number] =>
        GROUP_OPTIONS.includes(item as (typeof GROUP_OPTIONS)[number]),
    );

    const birthday = normalizeBirthdayToIsoDateTime(input.birthday);
    if (input.birthday?.trim() && !birthday) {
      throw new Error('Ngày sinh không hợp lệ.');
    }

    let avatar: string | undefined;
    if (input.avatarBase64) {
      const { mimeType, buffer } = base64DataUrlToBuffer(input.avatarBase64);
      const fileName = buildShopLogoFileName(mimeType);
      const { presignedUrl, url } = await createPresignedUrl({
        fileName,
        type: ImageTypeValues.AVATAR,
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
          '[updateUserAction] Upload avatar failed:',
          putRes.status,
          text,
        );
        throw new Error('Tải ảnh đại diện thất bại.');
      }

      avatar = url;
    }

    await updateUserById(input.id, {
      phoneNumber: input.phoneNumber || undefined,
      avatar,
      gender,
      birthday,
      group,
      provinceId: input.provinceId,
      provinceName: input.provinceName,
      districtId: input.districtId,
      districtName: input.districtName,
      wardId: input.wardId,
      wardName: input.wardName,
      address: input.address,
    });

    revalidatePath('/users');
    revalidatePath(`/users/${input.id}`);
    return { ok: true };
  } catch (error) {
    const data = (error as { response?: { data?: { message?: unknown } } })
      ?.response?.data;
    const fallbackMessage =
      error instanceof Error ? error.message : 'Cập nhật user thất bại.';
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : typeof data?.message === 'string'
        ? data.message
        : fallbackMessage;

    return { ok: false, message };
  }
}
