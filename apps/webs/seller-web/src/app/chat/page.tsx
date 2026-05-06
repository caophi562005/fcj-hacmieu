import { ChatLayout, type ChatPeer } from '@common/convex/index';
import { redirect } from 'next/navigation';
import { getAuth } from '../../lib/auth';

export const metadata = { title: 'Quản lý Tin nhắn — V-Shop Seller' };

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
        name: sp.name ?? 'Khách hàng',
        avatar: sp.avatar ?? '',
      }
    : null;

  // Seller layout: topbar 4rem + main padding (p-6 = 1.5rem top+bottom).
  // Dùng flex-col chiếm đúng phần viewport còn lại để ChatLayout không tràn
  // và không sinh scroll dọc ngoài.
  return (
    <div className="flex flex-col h-[calc(100svh-7rem)]">
      <div className="shrink-0 mb-4">
        <h1 className="text-3xl font-bold text-ink">Quản lý Tin nhắn</h1>
        <p className="text-ink-muted text-sm mt-1">
          Trò chuyện trực tiếp với khách hàng của shop bạn.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatLayout
          viewer={{ id: user.id, name: user.name, avatar: user.avatar }}
          initialPeer={initialPeer}
        />
      </div>
    </div>
  );
}
