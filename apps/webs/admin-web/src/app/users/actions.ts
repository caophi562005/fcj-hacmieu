'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { revalidatePath } from 'next/cache';
import { updateUserById } from '../../lib/admin-iam';
import { base64DataUrlToBuffer } from '../../lib/image-base64';
import { buildShopLogoFileName, createPresignedUrl } from '../../lib/media';

const GROUP_OPTIONS = ['CUSTOMER', 'SELLER', 'ADMIN'] as const;

export async function updateUserAction(input: {
  id: string;
  phoneNumber?: string;
  avatarBase64?: string;
  gender?: string;
  birthday?: string;
  group?: string[];
}) {
  try {
    const gender = ['MALE', 'FEMALE', 'OTHER'].includes(input.gender ?? '')
      ? (input.gender as 'MALE' | 'FEMALE' | 'OTHER')
      : undefined;

    const group = (input.group ?? []).filter(
      (item): item is (typeof GROUP_OPTIONS)[number] =>
        GROUP_OPTIONS.includes(item as (typeof GROUP_OPTIONS)[number]),
    );

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
      birthday: input.birthday || undefined,
      group,
    });

    revalidatePath('/users');
    revalidatePath(`/users/${input.id}`);
    return { ok: true };
  } catch (error) {
    const data = (error as { response?: { data?: { message?: unknown } } })
      ?.response?.data;
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : typeof data?.message === 'string'
        ? data.message
        : 'Cập nhật user thất bại.';

    return { ok: false, message };
  }
}
