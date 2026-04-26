import { Camera, Coins, TicketPercent, Package } from 'lucide-react';
import { getAuth } from '../../lib/auth';

export default async function ProfilePage() {
  const user = (await getAuth())!;

  return (
    <>
      <div className="card p-5 mb-4 flex flex-wrap items-center gap-4">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover bg-surface-muted"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-lg font-semibold">Xin chào, {user.name}!</h1>
          <p className="text-sm text-ink-muted">
            Hạng thành viên:{' '}
            <span className="text-primary font-semibold">{user.membership}</span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <Stat icon={Coins} label="V-Xu" value={user.vXu.toLocaleString('vi-VN')} />
          <Stat icon={TicketPercent} label="Voucher" value={String(user.vouchers)} />
          <Stat icon={Package} label="Đơn mua" value="12" />
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-base font-semibold">Hồ sơ của tôi</h2>
        <p className="text-sm text-ink-muted mt-1">
          Quản lý thông tin để bảo mật tài khoản.
        </p>
      </div>

      <div className="card p-5 grid md:grid-cols-[1fr_220px] gap-6">
        <form className="space-y-4 order-2 md:order-1">
          <Field label="Họ và tên" defaultValue={user.name} />
          <Field label="Email" type="email" defaultValue={user.email} />
          <Field label="Số điện thoại" defaultValue={user.phone} />
          <div>
            <span className="text-sm font-medium block mb-1">Giới tính</span>
            <div className="flex gap-4 text-sm">
              {[
                { v: 'male', l: 'Nam' },
                { v: 'female', l: 'Nữ' },
                { v: 'other', l: 'Khác' },
              ].map((g) => (
                <label key={g.v} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    defaultChecked={user.gender === g.v}
                    className="accent-primary"
                  />
                  {g.l}
                </label>
              ))}
            </div>
          </div>
          <Field label="Ngày sinh" type="date" defaultValue={user.birthday} />
          <Field label="Địa chỉ" defaultValue={user.address} />
          <div className="pt-2">
            <button className="btn-primary btn-md">Lưu thay đổi</button>
          </div>
        </form>

        <div className="order-1 md:order-2 flex flex-col items-center text-center md:border-l md:border-border-subtle md:pl-6">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover bg-surface-muted"
            />
            <button
              type="button"
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-card hover:bg-primary-600 transition-colors"
              aria-label="Đổi ảnh đại diện"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-ink-subtle mt-3">
            Ảnh JPG/PNG, tối đa 2MB.
          </p>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  type = 'text',
  defaultValue,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} defaultValue={defaultValue} className="input mt-1" />
    </label>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-3 text-center bg-surface-alt border border-border-subtle">
      <Icon className="w-5 h-5 text-primary mx-auto" />
      <div className="text-xs text-ink-subtle mt-1">{label}</div>
      <div className="font-bold text-primary">{value}</div>
    </div>
  );
}
