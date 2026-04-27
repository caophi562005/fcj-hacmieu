'use server';

import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE } from '../../../lib/auth';
import { changePassword } from '../../../lib/iam';

export type ChangePasswordState = {
  ok: boolean;
  message: string;
};

// Cognito password policy mặc định: tối thiểu 8 ký tự, có hoa/thường/số.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const c = await cookies();
  const accessToken = c.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return { ok: false, message: 'Phiên đăng nhập đã hết hạn.' };
  }

  const previousPassword = String(formData.get('previousPassword') ?? '');
  const proposedPassword = String(formData.get('proposedPassword') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!previousPassword || !proposedPassword || !confirmPassword) {
    return { ok: false, message: 'Vui lòng nhập đầy đủ các trường.' };
  }

  if (proposedPassword !== confirmPassword) {
    return { ok: false, message: 'Mật khẩu xác nhận không khớp.' };
  }

  if (previousPassword === proposedPassword) {
    return {
      ok: false,
      message: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
    };
  }

  if (!PASSWORD_RULE.test(proposedPassword)) {
    return {
      ok: false,
      message:
        'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và chữ số.',
    };
  }

  try {
    await changePassword(
      { accessToken },
      { previousPassword, proposedPassword },
    );
    return { ok: true, message: 'Đổi mật khẩu thành công.' };
  } catch (err) {
    const data = (err as { response?: { data?: { message?: string } } })
      ?.response?.data;
    const msg =
      data?.message ?? 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.';
    return { ok: false, message: msg };
  }
}
