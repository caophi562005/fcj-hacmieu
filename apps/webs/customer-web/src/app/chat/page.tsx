import { redirect } from 'next/navigation';
import { MainShell } from '../../components/MainShell';
import { ChatPageClient } from './ChatPageClient';
import { CONVERSATIONS } from '../../components/chatData';
import { getAuth } from '../../lib/auth';

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const user = await getAuth();
  if (!user) redirect('/login?next=/chat');

  const sp = await searchParams;
  const initialId =
    (sp?.to && CONVERSATIONS.find((c) => c.id === sp.to)?.id) ??
    CONVERSATIONS[0].id;

  return (
    <MainShell hideFooter>
      <div className="container-page py-3 md:py-4">
        <ChatPageClient
          conversations={CONVERSATIONS}
          initialId={initialId}
        />
      </div>
    </MainShell>
  );
}
