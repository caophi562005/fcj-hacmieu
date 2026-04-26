import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Header } from './Header';

export async function MainShell({
  children,
  hideFooter,
}: {
  children: ReactNode;
  hideFooter?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  );
}
