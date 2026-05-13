import { DashboardTopbar, UserMenu } from '@common/web-ui/index';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { changePasswordAction } from '../app/account/password/actions';
import { logoutAction } from '../app/login/actions';
import { getAuth } from '../lib/auth';

export async function SellerTopbar() {
  const user = await getAuth();

  const rightSlot = (
    <div className="flex items-center gap-2">
      {user ? (
        <UserMenu
          user={{ name: user.name, email: user.email, avatar: user.avatar }}
          logoutAction={logoutAction}
          changePasswordAction={changePasswordAction}
        />
      ) : (
        <Link
          href="/login"
          className="btn-primary btn-sm"
          aria-label="Đăng nhập"
        >
          <LogIn className="w-4 h-4" />
          <span>Đăng nhập</span>
        </Link>
      )}
    </div>
  );

  return <DashboardTopbar rightSlot={rightSlot} />;
}
