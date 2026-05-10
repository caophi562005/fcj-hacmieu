'use client';

import { ImagePlus, Undo2, UserRound } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { fileToBase64DataUrl } from '../../../lib/image-base64';
import { updateUserAction } from '../actions';

type Props = {
  user: {
    id: string;
    email: string | null;
    username: string | null;
    phoneNumber: string | null;
    avatar: string | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    birthday: string | null;
    status: string;
    group: string[];
  };
};

const GROUP_OPTIONS = ['CUSTOMER', 'SELLER', 'ADMIN'] as const;

function formatBirthdayForInput(raw: string | null): string {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function UserEditForm({ user }: Props) {
  const [isPending, startTransition] = useTransition();
  const [avatarNewBase64, setAvatarNewBase64] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarPreview = avatarNewBase64 ?? user.avatar ?? '';
  const initialBirthday = formatBirthdayForInput(user.birthday);

  return (
    <form
      className="card p-6 md:p-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const group = formData
          .getAll('group')
          .map((value) => String(value))
          .filter((value): value is (typeof GROUP_OPTIONS)[number] =>
            GROUP_OPTIONS.includes(value as (typeof GROUP_OPTIONS)[number]),
          );

        startTransition(async () => {
          const result = await updateUserAction({
            id: user.id,
            phoneNumber: String(formData.get('phoneNumber') || ''),
            avatarBase64: avatarNewBase64 || undefined,
            gender: String(formData.get('gender') || ''),
            birthday: String(formData.get('birthday') || ''),
            group,
          });

          if (result.ok) {
            toast.success('Cập nhật tài khoản thành công.');
          } else {
            toast.error(result.message || 'Cập nhật tài khoản thất bại.');
          }
        });
      }}
    >
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email" value={user.email || ''} disabled />
          <Field label="Username" value={user.username || ''} disabled />
          <Field
            name="phoneNumber"
            label="Số điện thoại"
            defaultValue={user.phoneNumber || ''}
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Ảnh đại diện
            </label>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = '';
                if (!file) return;

                if (
                  !['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
                ) {
                  toast.error('Chỉ hỗ trợ ảnh PNG/JPG/JPEG.');
                  return;
                }

                try {
                  const base64DataUrl = await fileToBase64DataUrl(file);
                  setAvatarNewBase64(base64DataUrl);
                } catch {
                  toast.error('Đọc ảnh thất bại. Vui lòng thử lại.');
                }
              }}
            />

            <div className="border border-slate-200 rounded-xl p-4 bg-surface-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserRound className="w-8 h-8 text-ink-subtle" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-200 text-sm text-ink-muted hover:text-primary hover:border-primary hover:bg-primary-50/40 transition-colors duration-200 cursor-pointer"
                  >
                    <ImagePlus className="w-4 h-4" />
                    {avatarPreview ? 'Đổi ảnh' : 'Tải ảnh'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarNewBase64(null)}
                    disabled={!avatarNewBase64}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-200 text-sm text-ink-muted enabled:hover:text-danger enabled:hover:border-red-200 enabled:hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Undo2 className="w-4 h-4" />
                    Hoàn tác
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Giới tính
            </label>
            <select
              name="gender"
              defaultValue={user.gender ?? ''}
              className="input cursor-pointer"
            >
              <option value="">Không cập nhật</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          <Field
            name="birthday"
            label="Ngày sinh"
            defaultValue={initialBirthday}
            type="date"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">
          Phân quyền hệ thống
        </h2>
        <Field label="User ID" value={user.id} disabled />
        <Field label="Status" value={user.status} disabled />
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Group
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {GROUP_OPTIONS.map((group) => (
              <label
                key={group}
                className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 h-10 bg-white cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="group"
                  value={group}
                  defaultChecked={user.group.includes(group)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-ink">{group}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          className="btn-primary btn-md"
          disabled={isPending}
        >
          {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  value,
  defaultValue,
  type,
  disabled,
}: {
  name?: string;
  label: string;
  value?: string;
  defaultValue?: string;
  type?: 'text' | 'date';
  disabled?: boolean;
}) {
  const inputProps =
    value !== undefined ? { value, readOnly: true } : { defaultValue };

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type ?? 'text'}
        {...inputProps}
        disabled={disabled}
        className="input disabled:bg-slate-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}
