import { UserStatusValues } from '@common/constants/user.constant';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { CopyButton } from '../../components/CopyButton';
import { Pagination } from '../../components/Pagination';
import { getManyUsers } from '../../lib/admin-iam';

type SearchParams = {
  page?: string;
  email?: string;
  username?: string;
  gender?: string;
  status?: string;
  group?: string;
};

const STATUS_STYLE: Record<string, string> = {
  [UserStatusValues.ACTIVE]:
    'bg-emerald-100 text-emerald-700 border-emerald-200',
  [UserStatusValues.INACTIVE]: 'bg-slate-100 text-slate-600 border-slate-200',
  [UserStatusValues.BLOCKED]: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABEL: Record<string, string> = {
  [UserStatusValues.ACTIVE]: 'Hoạt động',
  [UserStatusValues.INACTIVE]: 'Không hoạt động',
  [UserStatusValues.BLOCKED]: 'Bị khóa',
};

const GENDER_LABEL: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: {
  page?: number;
  email?: string;
  username?: string;
  gender?: string;
  status?: string;
  group?: string;
}) {
  const sp = new URLSearchParams();
  if (query.email) sp.set('email', query.email);
  if (query.username) sp.set('username', query.username);
  if (query.gender) sp.set('gender', query.gender);
  if (query.status) sp.set('status', query.status);
  if (query.group) sp.set('group', query.group);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/users?${qs}` : '/users';
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const email = (sp.email ?? '').trim();
  const username = (sp.username ?? '').trim();
  const gender = (sp.gender ?? '').trim();
  const status = (sp.status ?? '').trim();
  const group = (sp.group ?? '').trim();

  const data = await getManyUsers({
    page,
    limit: 10,
    email: email || undefined,
    username: username || undefined,
    gender: gender || undefined,
    status: status || undefined,
    group: group || undefined,
  });

  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý tài khoản</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {data.totalItems} người dùng.
        </p>
      </div>

      <form
        action="/users"
        method="GET"
        className="card p-4 grid grid-cols-1 md:grid-cols-6 gap-3"
      >
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
          <input
            name="email"
            defaultValue={email}
            placeholder="Email"
            className="input pl-9"
          />
        </div>
        <input
          name="username"
          defaultValue={username}
          placeholder="Tên đăng nhập"
          className="input"
        />
        <select
          name="gender"
          defaultValue={gender}
          className="input cursor-pointer"
        >
          <option value="">Giới tính</option>
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          <option value="OTHER">Khác</option>
        </select>
        <select
          name="status"
          defaultValue={status}
          className="input cursor-pointer"
        >
          <option value="">Trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Không hoạt động</option>
          <option value="BLOCKED">Bị khóa</option>
        </select>
        <select
          name="group"
          defaultValue={group}
          className="input cursor-pointer"
        >
          <option value="">Nhóm quyền</option>
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="SELLER">SELLER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <div className="md:col-span-6 flex justify-end">
          <button type="submit" className="btn-primary btn-md">
            Tìm kiếm
          </button>
        </div>
      </form>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold w-[140px]">
                  ID
                </th>
                <th className="py-3 px-4 text-left font-semibold">Email</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Tên đăng nhập
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Số điện thoại
                </th>
                <th className="py-3 px-4 text-left font-semibold">Giới tính</th>
                <th className="py-3 px-4 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Nhóm quyền
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-ink-muted">
                    Không có dữ liệu người dùng.
                  </td>
                </tr>
              )}
              {data.users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/users/${u.id}`}
                        className="font-mono text-xs text-ink-subtle truncate max-w-[80px] hover:text-primary transition-colors cursor-pointer"
                        title={u.id}
                      >
                        {u.id.slice(0, 8)}…
                      </Link>
                      <CopyButton value={u.id} label="Copy ID" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {u.email ? (
                      <Link
                        href={`/users/${u.id}`}
                        className="text-ink hover:text-primary transition-colors cursor-pointer"
                      >
                        {u.email}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4">{u.username || '—'}</td>
                  <td className="py-3 px-4">{u.phoneNumber || '—'}</td>
                  <td className="py-3 px-4">
                    {u.gender ? (GENDER_LABEL[u.gender] ?? u.gender) : '—'}
                  </td>
                  <td className="py-3 px-4 text-center align-middle">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLE[u.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      {STATUS_LABEL[u.status] ?? u.status ?? '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {Array.isArray(u.group) ? u.group.join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(n) =>
          buildHref({
            page: n,
            email,
            username,
            gender,
            status,
            group,
          })
        }
        ariaLabel="Phân trang users"
      />
    </div>
  );
}
