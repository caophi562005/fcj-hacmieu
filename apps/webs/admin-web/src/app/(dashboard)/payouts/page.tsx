import { Pagination } from '@common/web-ui/index';
import Link from 'next/link';
import { getManyPayouts } from '../../../lib/admin-shop-wallet';
import { PayoutStatusButtons } from './ui';

type SearchParams = { page?: string; status?: string; shopId?: string };

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: { page?: number; status?: string; shopId?: string }) {
  const sp = new URLSearchParams();
  if (query.status) sp.set('status', query.status);
  if (query.shopId) sp.set('shopId', query.shopId);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/payouts?${qs}` : '/payouts';
}

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const status = (sp.status ?? '').trim();
  const shopId = (sp.shopId ?? '').trim();

  const data = await getManyPayouts({
    page,
    limit: 10,
    status: status || undefined,
    shopId: shopId || undefined,
  });
  const safeData = data ?? {
    page,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
    payouts: [],
  };
  const payouts = Array.isArray(safeData.payouts) ? safeData.payouts : [];
  const totalPages = Math.max(safeData.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Yêu cầu rút tiền</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {safeData.totalItems} yêu cầu.
        </p>
      </div>

      <form
        action="/payouts"
        method="GET"
        className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <input
          name="status"
          defaultValue={status}
          placeholder="Status"
          className="input"
        />
        <input
          name="shopId"
          defaultValue={shopId}
          placeholder="Shop ID"
          className="input"
        />
        <button type="submit" className="btn-primary btn-md">
          Tìm kiếm
        </button>
      </form>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Shop</th>
                <th className="py-3 px-4 text-left font-semibold">Amount</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-ink-muted">
                    Không có payout.
                  </td>
                </tr>
              )}
              {payouts.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/payouts/${p.id}?shopId=${p.shopId}`}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      {p.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="py-3 px-4">{p.shopId}</td>
                  <td className="py-3 px-4">
                    {(p.amount ?? 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-3 px-4">{p.status}</td>
                  <td className="py-3 px-4">
                    <PayoutStatusButtons shopId={p.shopId} payoutId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(n) => buildHref({ page: n, status, shopId })}
      />
    </div>
  );
}
