import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserById } from '../../../lib/admin-iam';
import { UserEditForm } from './user-edit-form';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết tài khoản</h1>
          <p className="text-ink-muted text-sm mt-1">ID: {user.id}</p>
        </div>
        <Link href="/users" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <UserEditForm
          user={{
            id: user.id,
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            gender: user.gender,
            birthday: user.birthday,
            status: user.status,
            group: user.group,
          }}
        />
      </div>
    </div>
  );
}
