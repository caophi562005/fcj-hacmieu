'use client';

import { GenderValues, type GenderType } from '@common/constants/user.constant';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfileAction, type UpdateProfileState } from './actions';

const INITIAL_STATE: UpdateProfileState = { ok: false, message: '' };

type Props = {
  name: string;
  email: string;
  phone: string;
  gender: GenderType;
  birthday: string;
};

export function ProfileForm({ name, email, phone, gender, birthday }: Props) {
  const [state, formAction] = useActionState(updateProfileAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4 order-2 md:order-1">
      <ReadonlyField label="Họ và tên" value={name} />
      <ReadonlyField label="Email" value={email} />

      <Field
        label="Số điện thoại"
        name="phoneNumber"
        defaultValue={phone}
        placeholder="VD: 0901234567"
      />

      <div>
        <span className="text-sm font-medium block mb-1">Giới tính</span>
        <div className="flex gap-4 text-sm">
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

      {state.message && (
        <p
          className={`text-sm ${
            state.ok ? 'text-success' : 'text-danger'
          }`}
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
