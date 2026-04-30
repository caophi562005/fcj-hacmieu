import type { ReactNode } from 'react';
import { Footer } from './Footer';

// Header & BottomNav đã ở `app/layout.tsx` (persistent across navigation).
// `MainShell` giờ chỉ wrap nội dung page + render Footer theo cờ `hideFooter`.
export function MainShell({
  children,
  hideFooter,
}: {
  children: ReactNode;
  hideFooter?: boolean;
}) {
  return (
    <>
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
