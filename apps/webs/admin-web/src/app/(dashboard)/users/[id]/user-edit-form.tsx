'use client';

import { fileToBase64DataUrl } from '@common/web-core/lib/image-base64';
import { IMAGE_ACCEPT } from '@common/web-core/lib/image-constants';
import { ImagePlus, Undo2, UserRound } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import type {
  DistrictResponse,
  ProvinceResponse,
  WardResponse,
} from '../../../../lib/location';
import { updateUserAction } from '../actions';
import { loadDistricts, loadWards } from './lookups';

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
    provinceId: number;
    districtId: number;
    wardId: number;
    address: string;
  };
  provinces: ProvinceResponse[];
  initialDistricts: DistrictResponse[];
  initialWards: WardResponse[];
};

const GROUP_OPTIONS = ['CUSTOMER', 'SELLER', 'ADMIN'] as const;

function formatBirthdayForInput(raw: string | null): string {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function UserEditForm({
  user,
  provinces,
  initialDistricts,
  initialWards,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [avatarNewBase64, setAvatarNewBase64] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarPreview = avatarNewBase64 ?? user.avatar ?? '';
  const initialBirthday = formatBirthdayForInput(user.birthday);

  const [provinceId, setProvinceId] = useState(user.provinceId);
  const [districtId, setDistrictId] = useState(user.districtId);
  const [wardId, setWardId] = useState(user.wardId);

  const [districts, setDistricts] = useState<DistrictResponse[]>(initialDistricts);
  const [wards, setWards] = useState<WardResponse[]>(initialWards);

  const [isPendingDistricts, startTransitionDistricts] = useTransition();
  const [isPendingWards, startTransitionWards] = useTransition();

  const [provinceName, setProvinceName] = useState(
    () => provinces.find((p) => p.id === user.provinceId)?.name || '',
  );
  const [districtName, setDistrictName] = useState(
    () => initialDistricts.find((d) => d.id === user.districtId)?.name || '',
  );
  const [wardName, setWardName] = useState(
    () => initialWards.find((w) => w.id === user.wardId)?.name || '',
  );

  // Fetch districts when province changes
  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      setDistrictId(0);
      setDistrictName('');
      setWardId(0);
      setWardName('');
      return;
    }

    if (provinceId === user.provinceId) {
      setDistricts(initialDistricts);
      return;
    }

    startTransitionDistricts(async () => {
      const data = await loadDistricts(provinceId);
      setDistricts(data);
      setWards([]);
      setDistrictId(0);
      setDistrictName('');
      setWardId(0);
      setWardName('');
    });
  }, [provinceId, user.provinceId, initialDistricts]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!districtId) {
      setWards([]);
      setWardId(0);
      setWardName('');
      return;
    }

    if (districtId === user.districtId) {
      setWards(initialWards);
      return;
    }

    startTransitionWards(async () => {
      const data = await loadWards(districtId);
      setWards(data);
      setWardId(0);
      setWardName('');
    });
  }, [districtId, user.districtId, initialWards]);

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
            provinceId: formData.get('provinceId') ? Number(formData.get('provinceId')) : undefined,
            provinceName: String(formData.get('provinceName') || ''),
            districtId: formData.get('districtId') ? Number(formData.get('districtId')) : undefined,
            districtName: String(formData.get('districtName') || ''),
            wardId: formData.get('wardId') ? Number(formData.get('wardId')) : undefined,
            wardName: String(formData.get('wardName') || ''),
            address: String(formData.get('address') || ''),
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
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = '';
                if (!file) return;

                if (
                  ![
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                    'image/webp',
                  ].includes(file.type)
                ) {
                  toast.error('Chỉ hỗ trợ ảnh PNG/JPG/JPEG/WEBP.');
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
        <h2 className="text-base font-semibold text-ink">Địa chỉ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Tỉnh / Thành
            </label>
            <select
              name="provinceId"
              value={provinceId || ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProvinceId(val);
                setProvinceName(
                  provinces.find((p) => p.id === val)?.name || '',
                );
              }}
              className="input"
            >
              <option value="">Chọn Tỉnh / Thành</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input type="hidden" name="provinceName" value={provinceName} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Quận / Huyện
            </label>
            <select
              name="districtId"
              value={districtId || ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDistrictId(val);
                setDistrictName(
                  districts.find((d) => d.id === val)?.name || '',
                );
              }}
              disabled={isPendingDistricts || !districts.length}
              className="input disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">Chọn Quận / Huyện</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input type="hidden" name="districtName" value={districtName} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Phường / Xã
            </label>
            <select
              name="wardId"
              value={wardId || ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setWardId(val);
                setWardName(wards.find((w) => w.id === val)?.name || '');
              }}
              disabled={isPendingWards || !wards.length}
              className="input disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">Chọn Phường / Xã</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <input type="hidden" name="wardName" value={wardName} />
          </div>
        </div>
        <Field
          name="address"
          label="Địa chỉ cụ thể"
          defaultValue={user.address}
        />
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
