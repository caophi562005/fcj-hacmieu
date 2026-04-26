export type Shop = {
  id: string;
  name: string;
  banner: string;
  avatar: string;
  verified: boolean;
  productCount: string;
  rating: number;
  responseRate: string;
  joined: string;
  description: string;
};

export const SHOPS: Record<string, Shop> = {
  techzone: {
    id: 'techzone',
    name: 'V-Shop Official Store',
    banner:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80',
    avatar:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&q=80',
    verified: true,
    productCount: '1.2k',
    rating: 4.9,
    responseRate: '98%',
    joined: '3 năm trước',
    description:
      'Cửa hàng chính hãng V-Shop — Cam kết chất lượng, bảo hành 12 tháng, đổi trả 7 ngày. Miễn phí vận chuyển toàn quốc cho đơn từ 200.000₫.',
  },
};

export const DEFAULT_SHOP_ID = 'techzone';

export function getShop(id: string): Shop {
  return SHOPS[id] ?? { ...SHOPS[DEFAULT_SHOP_ID], id };
}
