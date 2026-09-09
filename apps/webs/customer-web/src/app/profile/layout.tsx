import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { MainShell } from '../../components/MainShell';
import { ProfileSidebar } from '../../components/ProfileSidebar';
import { getAuth } from '../../lib/auth';

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAuth();
  if (!user) redirect('/login?next=/profile');
  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-4 md:gap-6">
          <ProfileSidebar user={user} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </MainShell>
  );
}
