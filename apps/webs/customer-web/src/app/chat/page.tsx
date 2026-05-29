import { ChatLayout, type ChatPeer } from '@common/convex/index';
import { redirect } from 'next/navigation';
import { MainShell } from '../../components/MainShell';
import { getAuth } from '../../lib/auth';
import { getShopById } from '../../lib/shop';

export const metadata = { title: 'Tin nhắn — V-Shop' };

type SearchParams = {
  shopId?: string;
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
  const sp = (await searchParams) ?? {};
  
  if (!user) {
    const qs = new URLSearchParams(sp as Record<string, string>).toString();
    const nextUrl = qs ? `/chat?${qs}` : '/chat';
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
  }
  let initialPeer: ChatPeer | null = null;

  if (sp.shopId) {
    const shop = await getShopById(sp.shopId);
    if (shop) {
      initialPeer = {
        id: shop.userId || shop.id, // Fallback nếu dữ liệu cũ không có userId
        name: shop.name,
        avatar: shop.logo ?? '',
      };
    }
  } else if (sp.to) {
    initialPeer = {
      id: sp.to,
      name: sp.name ?? 'Người dùng',
      avatar: sp.avatar ?? '',
    };
  }

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
