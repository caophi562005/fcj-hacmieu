import { Pagination } from '@common/web-ui/index';
import { Film, Search } from 'lucide-react';
import { getManyVideos } from '../../../lib/video';
import { VideoCard } from './_components/VideoCard';

export const metadata = { title: 'Quản lý Video — V-Shop Admin' };

function parsePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function buildHref(opts: { page?: number; shopId?: string; status?: string }): string {
  const sp = new URLSearchParams();
  if (opts.shopId) sp.set('shopId', opts.shopId);
  if (opts.status) sp.set('status', opts.status);
  if (opts.page && opts.page > 1) sp.set('page', String(opts.page));
  const qs = sp.toString();
  return qs ? `/videos?${qs}` : '/videos';
}

type SearchParams = { page?: string; status?: string; shopId?: string };

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const shopId = (sp.shopId ?? '').trim();
  const limit = 12;

  const data = await getManyVideos({ page, limit, status: sp.status, shopId: shopId || undefined });
  const videos = data.videos ?? [];
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý Video</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {data.totalItems ?? 0} video.
        </p>
      </div>

      {/* Search bar */}
      <form
        action="/videos"
        method="GET"
        className="card p-4 flex items-center gap-3"
      >
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
          <input
            type="text"
            name="shopId"
            defaultValue={shopId}
            placeholder="Tìm kiếm theo shopId..."
            className="input pl-9 w-full"
          />
        </div>
        <button type="submit" className="btn-primary btn-md">
          Lọc
        </button>
      </form>

      {videos.length === 0 ? (
        <div className="card py-16 flex flex-col items-center justify-center text-center">
          <Film className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-ink-muted text-lg font-medium">
            Chưa có video nào.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(n) => buildHref({ page: n, shopId, status: sp.status })}
        ariaLabel="Phân trang video"
      />
    </div>
  );
}
