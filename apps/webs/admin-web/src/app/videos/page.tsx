import { Pagination } from '@common/web-ui/index';
import { Film } from 'lucide-react';
import { getManyVideos } from '../../lib/video';
import { VideoCard } from './_components/VideoCard';

export const metadata = { title: 'Quản lý Video — V-Shop Admin' };

function parsePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function buildHref(page: number): string {
  if (page <= 1) return '/videos';
  return `/videos?page=${page}`;
}

type SearchParams = { page?: string; status?: string };

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const limit = 12;

  const data = await getManyVideos({ page, limit, status: sp.status });
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
        buildHref={buildHref}
        ariaLabel="Phân trang video"
      />
    </div>
  );
}
