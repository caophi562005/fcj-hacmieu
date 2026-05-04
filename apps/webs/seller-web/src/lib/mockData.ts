// Mock data dùng tạm cho seller-web. Sẽ thay bằng BFF API sau.

export const currentShop = {
  id: 'shop-1',
  name: 'Shop Yêu Thích',
  ownerName: 'Nguyễn Văn A',
  avatar:
    'https://api.dicebear.com/7.x/initials/svg?seed=Shop+Yeu+Thich&backgroundColor=FF6B35',
  walletBalance: 124_500_000,
  bank: { name: 'VIETCOMBANK', masked: '**** **** **** 4567', holder: 'NGUYEN VAN A' },
};

// ========== DASHBOARD ==========
export const dashboardStats = {
  walletBalance: 25_000_000,
  pendingOrders: 12,
  shippingOrders: 45,
  outOfStock: 3,
};

export const revenue7Days = [
  { day: 'T2', value: 40 },
  { day: 'T3', value: 60 },
  { day: 'T4', value: 50 },
  { day: 'T5', value: 80 },
  { day: 'T6', value: 65 },
  { day: 'T7', value: 90 },
  { day: 'CN', value: 100 },
];

// ========== PRODUCTS ==========
export type ProductStatus = 'active' | 'hidden' | 'violation';

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  violationReason?: string;
  image?: string;
  brand?: string;
  description?: string;
};

export const mockProducts: Product[] = [
  {
    id: 'p-1',
    name: 'Tai nghe Bluetooth không dây chống ồn chủ động Pro Max',
    sku: 'TN-BT-001',
    category: 'Điện tử > Tai nghe',
    price: 1_250_000,
    stock: 145,
    sold: 1024,
    status: 'active',
    brand: 'V-Brand',
    description: 'Chống ồn chủ động, pin 30h, kết nối đa thiết bị.',
  },
  {
    id: 'p-2',
    name: 'Áo thun cotton nam cổ tròn basic nhiều màu',
    sku: 'AT-NAM-BASIC',
    category: 'Thời trang > Áo nam',
    price: 150_000,
    stock: 0,
    sold: 450,
    status: 'hidden',
    brand: 'V-Brand',
    description: 'Chất liệu 100% cotton thoáng mát.',
  },
  {
    id: 'p-3',
    name: 'Bình giữ nhiệt logo thương hiệu X',
    sku: 'BGN-VP-09',
    category: 'Đời sống > Bình nước',
    price: 250_000,
    stock: 50,
    sold: 12,
    status: 'violation',
    violationReason: 'Vi phạm bản quyền hình ảnh',
  },
  {
    id: 'p-4',
    name: 'Giày thể thao nam siêu nhẹ 2024',
    sku: 'GTT-NAM-2024',
    category: 'Thời trang > Giày nam',
    price: 550_000,
    stock: 80,
    sold: 320,
    status: 'active',
  },
  {
    id: 'p-5',
    name: 'Đồng hồ thông minh bản Pro',
    sku: 'DH-PRO-01',
    category: 'Điện tử > Đồng hồ',
    price: 2_450_000,
    stock: 22,
    sold: 85,
    status: 'active',
  },
];

// ========== ORDERS ==========
export type OrderStatus =
  | 'pending' // Chờ xác nhận
  | 'processing' // Đang xử lý
  | 'shipping' // Đang giao
  | 'delivered' // Đã giao
  | 'cancelled'; // Đã hủy

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export type OrderItem = {
  productId: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  code: string;
  customerName: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'COD' | 'VNPAY' | 'MOMO';
  paymentStatus: 'paid' | 'unpaid';
  status: OrderStatus;
};

export const mockOrders: Order[] = [
  {
    id: 'o-1',
    code: 'VSH-982374',
    customerName: 'Nguyễn Văn A',
    createdAt: '2024-10-20T14:30:00Z',
    items: [
      {
        productId: 'p-4',
        name: 'Giày Thể Thao Nam Siêu Nhẹ Mẫu Mới Nhất 2024 - Đỏ Đen',
        variant: 'Đỏ, Size 42',
        quantity: 1,
        price: 550_000,
      },
    ],
    total: 550_000,
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    status: 'pending',
  },
  {
    id: 'o-2',
    code: 'VSH-982375',
    customerName: 'Trần Thị B',
    createdAt: '2024-10-19T09:15:00Z',
    items: [
      {
        productId: 'p-5',
        name: 'Đồng Hồ Thông Minh Bản Pro Mặt Vuông',
        variant: 'Trắng ngọc trai',
        quantity: 2,
        price: 2_450_000,
      },
      {
        productId: 'p-1',
        name: 'Tai Nghe Chụp Tai Bluetooth Chống Ồn',
        variant: 'Đen nhám',
        quantity: 1,
        price: 1_250_000,
      },
    ],
    total: 3_450_000,
    paymentMethod: 'VNPAY',
    paymentStatus: 'paid',
    status: 'processing',
  },
  {
    id: 'o-3',
    code: 'VSH-982376',
    customerName: 'Lê Văn C',
    createdAt: '2024-10-18T16:40:00Z',
    items: [
      {
        productId: 'p-2',
        name: 'Áo Thun Cotton Nam Cổ Tròn Basic',
        variant: 'Trắng, M',
        quantity: 3,
        price: 150_000,
      },
    ],
    total: 450_000,
    paymentMethod: 'MOMO',
    paymentStatus: 'paid',
    status: 'shipping',
  },
  {
    id: 'o-4',
    code: 'VSH-982377',
    customerName: 'Phạm Thị D',
    createdAt: '2024-10-15T10:00:00Z',
    items: [
      {
        productId: 'p-3',
        name: 'Bình giữ nhiệt Premium',
        quantity: 1,
        price: 250_000,
      },
    ],
    total: 250_000,
    paymentMethod: 'COD',
    paymentStatus: 'paid',
    status: 'delivered',
  },
  {
    id: 'o-5',
    code: 'VSH-982378',
    customerName: 'Hoàng Văn E',
    createdAt: '2024-10-14T08:20:00Z',
    items: [
      {
        productId: 'p-1',
        name: 'Tai nghe Bluetooth Pro Max',
        quantity: 1,
        price: 1_250_000,
      },
    ],
    total: 1_250_000,
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    status: 'cancelled',
  },
];

// ========== TRANSACTIONS (Finance) ==========
export type TransactionType = 'withdraw' | 'revenue' | 'refund';
export type TransactionStatus = 'processing' | 'completed' | 'failed';

export type Transaction = {
  id: string;
  code: string;
  createdAt: string;
  type: TransactionType;
  description: string;
  amount: number; // âm = trừ ví
  status: TransactionStatus;
};

export const mockTransactions: Transaction[] = [
  {
    id: 't-1',
    code: 'WD-847291',
    createdAt: '2024-10-24T10:24:00Z',
    type: 'withdraw',
    description: 'Rút tiền về ngân hàng',
    amount: -15_000_000,
    status: 'processing',
  },
  {
    id: 't-2',
    code: 'OR-923841',
    createdAt: '2024-10-24T08:15:00Z',
    type: 'revenue',
    description: 'Doanh thu đơn hàng',
    amount: 1_250_000,
    status: 'completed',
  },
  {
    id: 't-3',
    code: 'OR-923840',
    createdAt: '2024-10-23T16:45:00Z',
    type: 'revenue',
    description: 'Doanh thu đơn hàng',
    amount: 3_400_000,
    status: 'completed',
  },
  {
    id: 't-4',
    code: 'RF-112394',
    createdAt: '2024-10-22T09:30:00Z',
    type: 'refund',
    description: 'Hoàn tiền đơn hàng trả về',
    amount: -450_000,
    status: 'completed',
  },
];

// ========== CHAT ==========
export type ChatMessage = {
  id: string;
  from: 'customer' | 'shop';
  text: string;
  at: string;
  productRef?: { image: string; name: string; price: number };
};

export type Conversation = {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  online: boolean;
  lastMessage: string;
  lastAt: string;
  unread: number;
  tags: string[];
  stats: { completedOrders: number; totalSpent: number };
  messages: ChatMessage[];
  recentOrders: { code: string; productName: string; quantity: number; total: number; status: string }[];
};

export const mockConversations: Conversation[] = [
  {
    id: 'c-1',
    customerId: 'u-1',
    customerName: 'Nguyễn Thị Mai',
    customerAvatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Mai',
    online: true,
    lastMessage: 'Dạ shop cho em hỏi mẫu này còn size M không ạ?',
    lastAt: '2024-10-24T14:20:00Z',
    unread: 1,
    tags: ['Khách VIP', 'Hay mua Áo thun'],
    stats: { completedOrders: 12, totalSpent: 3_200_000 },
    messages: [
      {
        id: 'm-1',
        from: 'customer',
        text: 'Dạ shop cho em hỏi mẫu áo thun Basic Tee màu trắng còn size M không ạ?',
        at: '2024-10-24T14:20:00Z',
      },
      {
        id: 'm-2',
        from: 'customer',
        text: '',
        at: '2024-10-24T14:21:00Z',
        productRef: {
          image:
            'https://api.dicebear.com/7.x/shapes/svg?seed=Tshirt&backgroundColor=F1F5F9',
          name: 'Áo Thun Nam Basic Cotton 100% Thoáng Mát',
          price: 150_000,
        },
      },
      {
        id: 'm-3',
        from: 'shop',
        text:
          'Chào bạn, mẫu Basic Tee màu trắng hiện tại shop vẫn còn sẵn size M nhé ạ. Bạn có thể đặt hàng ngay để shop đóng gói gửi đi trong chiều nay nha!',
        at: '2024-10-24T14:22:00Z',
      },
    ],
    recentOrders: [
      {
        code: 'ORD-88291A',
        productName: 'Áo Thun Nam Basic Cotton 100%',
        quantity: 2,
        total: 300_000,
        status: 'Hoàn thành',
      },
      {
        code: 'ORD-55102B',
        productName: 'Áo Polo Nam Form Regular',
        quantity: 1,
        total: 250_000,
        status: 'Hoàn thành',
      },
    ],
  },
  {
    id: 'c-2',
    customerId: 'u-2',
    customerName: 'Trần Anh',
    customerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TA',
    online: false,
    lastMessage: 'Cảm ơn shop, mình đã nhận được hàng.',
    lastAt: '2024-10-24T10:45:00Z',
    unread: 0,
    tags: [],
    stats: { completedOrders: 5, totalSpent: 1_100_000 },
    messages: [
      { id: 'm-1', from: 'customer', text: 'Cảm ơn shop, mình đã nhận được hàng.', at: '2024-10-24T10:45:00Z' },
    ],
    recentOrders: [],
  },
  {
    id: 'c-3',
    customerId: 'u-3',
    customerName: 'Lê Hoàng Vũ',
    customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vu',
    online: false,
    lastMessage: 'Có hỗ trợ xuất hóa đơn VAT không shop?',
    lastAt: '2024-10-23T18:00:00Z',
    unread: 2,
    tags: ['Khách doanh nghiệp'],
    stats: { completedOrders: 3, totalSpent: 4_500_000 },
    messages: [
      { id: 'm-1', from: 'customer', text: 'Có hỗ trợ xuất hóa đơn VAT không shop?', at: '2024-10-23T18:00:00Z' },
    ],
    recentOrders: [],
  },
];

// ========== HELPERS ==========
export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '- ' : '';
  return `${sign}${Math.abs(amount).toLocaleString('vi-VN')}đ`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
