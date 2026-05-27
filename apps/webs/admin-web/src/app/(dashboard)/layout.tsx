import { SellerSidebar } from '../../components/SellerSidebar';
import { SellerTopbar } from '../../components/SellerTopbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SellerSidebar />
      <SellerTopbar />
      <main className="ml-sidebar pt-topbar min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </>
  );
}
