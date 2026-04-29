'use server';

import { ImageTypeValues } from '@common/constants/media.constant';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, getAuth } from '../../lib/auth';
import { createPresignedUrl, updateCurrentUser } from '../../lib/iam';

export type UploadAvatarState = {
  ok: boolean;
  message: string;
};

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadAvatarAction(
  _prev: UploadAvatarState,
  formData: FormData,
): Promise<UploadAvatarState> {
  const c = await cookies();
  const accessToken = c.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return { ok: false, message: 'Phiên đăng nhập đã hết hạn.' };
  }

  const file = formData.get('avatar');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Vui lòng chọn ảnh.' };
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false, message: 'Chỉ chấp nhận ảnh JPG, JPEG hoặc PNG.' };
  }

  if (file.size > MAX_SIZE) {
    return { ok: false, message: 'Ảnh vượt quá 2MB.' };
  }

  const auth = await getAuth();
  if (!auth) {
    return { ok: false, message: 'Không thể xác thực người dùng.' };
  }

  try {
    // 1. Lấy presigned URL từ BFF
    const { presignedUrl, url } = await createPresignedUrl(
      { accessToken },
      {
        fileName: file.name,
        type: ImageTypeValues.AVATAR,
      },
    );

    // 2. PUT file lên S3 qua presigned URL
    // Doc: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
    const buffer = Buffer.from(await file.arrayBuffer());
    const putRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: buffer,
    });

    if (!putRes.ok) {
      const text = await putRes.text();
      console.error('[uploadAvatar] S3 PUT failed:', putRes.status, text);
      return { ok: false, message: 'Tải ảnh lên S3 thất bại.' };
    }

    // 3. Update user.avatar = url public của S3 object
    await updateCurrentUser({ accessToken }, { avatar: url });

    // 4. Revalidate /profile để page render lại với avatar mới
    revalidatePath('/profile');
    return { ok: true, message: 'Cập nhật ảnh đại diện thành công.' };
  } catch (err) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? 'Cập nhật ảnh đại diện thất bại.';
    console.error('[uploadAvatar] error:', err);
    return { ok: false, message: msg };
  }
}
