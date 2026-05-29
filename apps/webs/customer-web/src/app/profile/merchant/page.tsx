import { redirect } from 'next/navigation';
import { isAuthed } from '../../../lib/auth';
import { getMyMerchant } from '../../../lib/shop';
import { MerchantForm } from './_components/MerchantForm';
import { MerchantInfo } from './_components/MerchantInfo';

export const metadata = { title: 'Giấy phép đăng ký shop — V-Shop' };

export default async function MerchantPage() {
  if (!(await isAuthed())) redirect('/login?next=/profile/merchant');

  const merchant = await getMyMerchant();

  return (
    <div className="max-w-3xl">
      {merchant ? (
        <MerchantInfo merchant={merchant} />
      ) : (
        <MerchantForm />
      )}
    </div>
  );
}
