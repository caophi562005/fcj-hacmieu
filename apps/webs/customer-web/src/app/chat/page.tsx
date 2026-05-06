import { ChatLayout, type ChatPeer } from '@common/convex/index';
import { redirect } from 'next/navigation';
import { MainShell } from '../../components/MainShell';
import { getAuth } from '../../lib/auth';

export const metadata = { title: 'Tin nhắn — V-Shop' };

type SearchParams = {
  to?: string;
  name?: string;
  avatar?: string;
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getAuth();
  if (!user) redirect('/login?next=/chat');

  const sp = (await searchParams) ?? {};
  const initialPeer: ChatPeer | null = sp.to
    ? {
        id: sp.to,
        name: sp.name ?? 'Người dùng',
        avatar: sp.avatar ?? '',
      }
    : null;

  return (
    <MainShell hideFooter>
      {/* Header customer-web ~4rem + padding ~1rem. Trừ để khung chat vừa màn
          hình, không sinh scroll dọc ngoài. */}
      <div className="container-page py-3 md:py-4 h-[calc(100svh-5rem)]">
        <ChatLayout
          viewer={{ id: user.id, name: user.name, avatar: user.avatar }}
          initialPeer={initialPeer}
        />
      </div>
    </MainShell>
  );
}
