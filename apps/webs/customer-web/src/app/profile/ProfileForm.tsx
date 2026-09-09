'use client';

import { GenderValues, type GenderType } from '@common/constants/user.constant';
import { useEffect, useState, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import type {
  DistrictResponse,
  ProvinceResponse,
  WardResponse,
} from '../../lib/location';
import { updateProfileAction, type UpdateProfileState } from './actions';
import { loadDistricts, loadWards } from './lookups';

const INITIAL_STATE: UpdateProfileState = { ok: false, message: '' };

type Props = {
  name: string;
  email: string;
  phone: string;
  gender: GenderType;
  birthday: string;
  initialProvinceId: number;
  initialDistrictId: number;
  initialWardId: number;
  initialAddress: string;
  provinces: ProvinceResponse[];
  initialDistricts: DistrictResponse[];
  initialWards: WardResponse[];
};

export function ProfileForm({
  name,
  email,
  phone,
  gender,
  birthday,
  initialProvinceId,
  initialDistrictId,
  initialWardId,
  initialAddress,
  provinces,
  initialDistricts,
  initialWards,
}: Props) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    INITIAL_STATE,
  );

  const [provinceId, setProvinceId] = useState(initialProvinceId);
  const [districtId, setDistrictId] = useState(initialDistrictId);
  const [wardId, setWardId] = useState(initialWardId);

  const [districts, setDistricts] =
    useState<DistrictResponse[]>(initialDistricts);
  const [wards, setWards] = useState<WardResponse[]>(initialWards);

  const [isPendingDistricts, startTransitionDistricts] = useTransition();
  const [isPendingWards, startTransitionWards] = useTransition();

  const [provinceName, setProvinceName] = useState(
    () => provinces.find((p) => p.id === initialProvinceId)?.name || '',
  );
  const [districtName, setDistrictName] = useState(
    () => initialDistricts.find((d) => d.id === initialDistrictId)?.name || '',
  );
  const [wardName, setWardName] = useState(
    () => initialWards.find((w) => w.id === initialWardId)?.name || '',
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

    if (provinceId === initialProvinceId) {
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
  }, [provinceId, initialProvinceId, initialDistricts]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!districtId) {
      setWards([]);
      setWardId(0);
      setWardName('');
      return;
    }

    if (districtId === initialDistrictId) {
      setWards(initialWards);
      return;
    }

    startTransitionWards(async () => {
      const data = await loadWards(districtId);
      setWards(data);
      setWardId(0);
      setWardName('');
    });
  }, [districtId, initialDistrictId, initialWards]);

  return (
    <form action={formAction} className="min-w-0 space-y-4 order-2 xl:order-1">
      <ReadonlyField label="Username" value={name} />
      <ReadonlyField label="Email" value={email} />

      <Field
        label="Số điện thoại"
        name="phoneNumber"
        defaultValue={phone}
        placeholder="VD: 0901234567"
      />

      <div>
        <span className="text-sm font-medium block mb-1">Giới tính</span>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {[
            { v: GenderValues.MALE, l: 'Nam' },
            { v: GenderValues.FEMALE, l: 'Nữ' },
            { v: GenderValues.OTHER, l: 'Khác' },
          ].map((g) => (
            <label key={g.v} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value={g.v}
                defaultChecked={gender === g.v}
                className="accent-primary"
              />
              {g.l}
            </label>
          ))}
        </div>
      </div>

      <Field
        label="Ngày sinh"
        name="birthday"
        type="date"
        defaultValue={birthday}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 [&>label]:min-w-0 [&_select]:min-w-0">
        <label className="block">
          <span className="text-sm font-medium">Tỉnh / Thành</span>
          <select
            name="provinceId"
            value={provinceId || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              setProvinceId(val);
              setProvinceName(provinces.find((p) => p.id === val)?.name || '');
            }}
            className="input mt-1"
          >
            <option value="">Chọn Tỉnh / Thành</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="provinceName" value={provinceName} />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Quận / Huyện</span>
          <select
            name="districtId"
            value={districtId || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              setDistrictId(val);
              setDistrictName(districts.find((d) => d.id === val)?.name || '');
            }}
            disabled={isPendingDistricts || !districts.length}
            className="input mt-1 disabled:bg-surface-muted"
          >
            <option value="">Chọn Quận / Huyện</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="districtName" value={districtName} />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Phường / Xã</span>
          <select
            name="wardId"
            value={wardId || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              setWardId(val);
              setWardName(wards.find((w) => w.id === val)?.name || '');
            }}
            disabled={isPendingWards || !wards.length}
            className="input mt-1 disabled:bg-surface-muted"
          >
            <option value="">Chọn Phường / Xã</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="wardName" value={wardName} />
        </label>
      </div>

      <Field
        label="Địa chỉ cụ thể"
        name="address"
        defaultValue={initialAddress}
        placeholder="Số nhà, tên đường..."
      />

      {state.message && (
        <p
          className={`text-sm ${state.ok ? 'text-success' : 'text-danger'}`}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary btn-md disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Đang lưu...' : 'Lưu thay đổi'}
    </button>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="input mt-1"
      />
    </label>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="text"
        value={value}
        readOnly
        disabled
        className="input mt-1 bg-surface-muted text-ink-muted cursor-not-allowed"
      />
    </label>
  );
}
