'use client';

import { Camera, Loader2 } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import {
  uploadAvatarAction,
  type UploadAvatarState,
} from './avatar-actions';

const INITIAL_STATE: UploadAvatarState = { ok: false, message: '' };

type Props = {
  src: string;
  alt: string;
};

export function AvatarUploader({ src, alt }: Props) {
  const [state, formAction, pending] = useActionState(
    uploadAvatarAction,
    INITIAL_STATE,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Tự alert lỗi/ thành công sau khi action chạy xong (giống ProfileForm).
  useEffect(() => {
    if (state.message && !pending) {
      // reset input để có thể chọn lại cùng file nếu cần
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [state.message, pending]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Tự submit form khi user chọn xong file
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center text-center md:border-l md:border-border-subtle md:pl-6">
      <form ref={formRef} action={formAction}>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-28 h-28 rounded-full object-cover bg-surface-muted"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-card hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Đổi ảnh đại diện"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleChange}
        />
      </form>
      <p className="text-xs text-ink-subtle mt-3">
        Ảnh JPG/PNG, tối đa 2MB.
      </p>
      {state.message && (
        <p
          className={`text-xs mt-2 ${
            state.ok ? 'text-success' : 'text-danger'
          }`}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
