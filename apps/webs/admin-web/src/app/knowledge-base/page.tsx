'use client';

import { api } from '@common/convex/lib/api';
import { useAction, useMutation, useQuery } from 'convex/react';
import { BookOpen, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';

const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ACCEPTED_EXTENSIONS = '.pdf,.txt,.csv,.docx';

export default function KnowledgeBasePage() {
  const files = useQuery(api.bot.files.list);
  const addFile = useAction(api.bot.files.addFile);
  const deleteFile = useMutation(api.bot.files.deleteFile);

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.txt')) {
      toast.error('Chỉ hỗ trợ PDF, TXT, CSV, DOCX');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File tối đa 10MB');
      return;
    }

    setUploading(true);
    try {
      const bytes = await file.arrayBuffer();
      await addFile({
        filename: file.name,
        mimeType: file.type || 'text/plain',
        bytes,
        category: category.trim() || undefined,
      });
      toast.success(`Đã upload "${file.name}" thành công`);
      setCategory('');
    } catch (err) {
      console.error(err);
      toast.error('Upload thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (id: any, title: string) => {
    if (!confirm(`Xoá "${title}" khỏi knowledge base?`)) return;
    try {
      await deleteFile({ id });
      toast.success('Đã xoá');
    } catch {
      toast.error('Xoá thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Knowledge Base</h1>
          <p className="text-sm text-ink-muted mt-1">
            Upload tài liệu để AI chatbot sử dụng khi trả lời khách hàng
          </p>
        </div>
      </div>

      {/* Upload section */}
      <div className="card p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload tài liệu
        </h2>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">
              Danh mục (tuỳ chọn)
            </span>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="VD: Chính sách, FAQ, Hướng dẫn..."
              className="input mt-1"
            />
          </label>
          <div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-primary btn-md cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {uploading ? 'Đang upload...' : 'Chọn file'}
            </button>
          </div>
        </div>
        <p className="text-xs text-ink-subtle mt-2">
          Hỗ trợ: PDF, TXT, CSV, DOCX. Tối đa 10MB.
        </p>
      </div>

      {/* File list */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Tài liệu đã upload</h2>
          <span className="text-xs text-ink-subtle ml-auto">
            {files?.length ?? 0} tài liệu
          </span>
        </div>

        {!files || files.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-ink-muted">
            Chưa có tài liệu nào. Upload file để AI chatbot có thể trả lời câu
            hỏi.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {files.map((file) => (
              <li key={file._id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded bg-primary-50 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {file.title}
                  </div>
                  <div className="text-xs text-ink-subtle">
                    {file.category && (
                      <span className="mr-2">{file.category}</span>
                    )}
                    <span
                      className={
                        file.status === 'ready'
                          ? 'text-success'
                          : 'text-warning'
                      }
                    >
                      {file.status === 'ready' ? '✓ Sẵn sàng' : '⏳ Đang xử lý'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(file._id, file.title)}
                  className="w-8 h-8 rounded hover:bg-red-50 text-ink-subtle hover:text-danger flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Xoá"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
