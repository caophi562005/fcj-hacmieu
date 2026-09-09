import { Pagination } from '@common/web-ui/index';
import { getMarketingCampaigns } from '../../../lib/admin-marketing';
import { getManyPromotions } from '../../../lib/admin-promotion';
import { MarketingCampaignGrid, MarketingToolbar } from './ui';

export default async function MarketingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const [campaigns, promotions] = await Promise.all([
    getMarketingCampaigns({
      page,
      limit: 10,
      status: query.status || undefined,
    }),
    getManyPromotions({ page: 1, limit: 100, status: 'ACTIVE' }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Email marketing</h1>
        <p className="text-sm text-ink-muted mt-1">
          Gửi ưu đãi và theo dõi hiệu quả; voucher sắp hết hạn được quét tự động
          qua SQS.
        </p>
      </div>
      <MarketingToolbar
        promotions={(promotions.promotions ?? []).map((promotion) => ({
          id: promotion.id,
          code: promotion.code,
          name: promotion.name,
        }))}
      />
      <MarketingCampaignGrid campaigns={campaigns.campaigns ?? []} />
      <Pagination
        page={page}
        totalPages={Math.max(campaigns.totalPages, 1)}
        buildHref={(next) =>
          next > 1 ? `/marketing?page=${next}` : '/marketing'
        }
      />
    </div>
  );
}
