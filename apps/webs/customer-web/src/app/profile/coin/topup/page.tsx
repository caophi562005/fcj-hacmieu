import { redirect } from 'next/navigation';
import { getAuth } from '../../../../lib/auth';
import { TopupClient } from './TopupClient';

export default async function TopupPage() {
  const user = await getAuth();
  if (!user) redirect('/login?next=/profile/coin/topup');

  return <TopupClient />;
}
