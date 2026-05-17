'use client';

import { Loader2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { createVideoAction } from '../actions';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

type Props = {
  productId?: string;
  onUploadComplete?: () => void;
};

type UploadState = 'idle' | 'creating' | 'uploading' | 'done' | 'error';

export function VideoUploadButton({ productId, onUploadComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file MP4, MOV, hoặc WebM.');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error('File video không được vượt quá 500MB.');
      return;
    }

    try {
      // 1. Create video record → get presigned URL
      setState('creating');
      const result = await createVideoAction({ productId });

      if (!result.ok || !result.presignedUrl) {
        toast.error(result.message || 'Tạo video thất bại.');
        setState('error');
        return;
      }

      // 2. Upload file to S3 via presigned URL
      setState('uploading');
      await uploadWithProgress(file, result.presignedUrl);

      setState('done');
      toast.success('Upload video thành công! Đang xử lý...');
      onUploadComplete?.();
    } catch (err) {
      console.error('[VideoUpload]', err);
      toast.error('Upload video thất bại.');
      setState('error');
    } finally {
      // Reset input
      if (inputRef.current) inputRef.current.value = '';
      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 2000);
    }
  }

  async function uploadWithProgress(file: File, presignedUrl: string) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(file);
    });
  }

  const isLoading = state === 'creating' || state === 'uploading';

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Chọn file video để upload"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="btn-primary btn-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {state === 'creating' && 'Đang tạo...'}
        {state === 'uploading' && `Đang upload ${progress}%`}
        {state === 'done' && 'Hoàn tất!'}
        {state === 'idle' && 'Upload Video'}
        {state === 'error' && 'Upload Video'}
      </button>

      {state === 'uploading' && (
        <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
}
