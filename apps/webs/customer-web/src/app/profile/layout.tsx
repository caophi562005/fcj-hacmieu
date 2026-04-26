import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
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
        <div className="grid md:grid-cols-[240px_1fr] gap-4 md:gap-6">
          <ProfileSidebar user={user} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </MainShell>
  );
}
