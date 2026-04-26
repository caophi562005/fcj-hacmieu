export type ChatMessage = {
  id: string;
  from: 'me' | 'shop';
  text: string;
  time: string;
  unread?: boolean;
};

export type Conversation = {
  id: string;
  shopName: string;
  shopAvatar: string;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unread?: number;
  draftPrefix?: string;
  messages: ChatMessage[];
};

const AVATAR = (seed: string) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffe3d2,e8f4fd,ffd6e7`;

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'techzone',
    shopName: 'TechZone Official',
    shopAvatar: AVATAR('TechZone'),
    online: true,
    lastMessage: 'Cảm ơn bạn đã quan tâm đến s...',
    lastTime: '10:42',
    unread: 2,
    messages: [
      {
        id: 'm1',
        from: 'me',
        text: 'Chào shop, sản phẩm này có tương thích với iPhone 13 không ạ?',
        time: '09:30',
      },
      {
        id: 'm2',
        from: 'shop',
        text: 'Chào bạn, cảm ơn bạn đã quan tâm đến sản phẩm của TechZone. Tai nghe XYZ hoàn toàn tương thích và kết nối ổn định với iPhone 13 nhé ạ.',
        time: '10:40',
      },
      {
        id: 'm3',
        from: 'shop',
        text: 'Hiện tại shop đang có mã giảm giá 10% cho đơn hàng trên 500.000₫. Bạn lấy mã ở trang chủ shop nhé!',
        time: '10:42',
        unread: true,
      },
    ],
  },
  {
    id: 'sneaker-hub',
    shopName: 'Sneaker Hub VN',
    shopAvatar: AVATAR('Sneaker Hub'),
    online: false,
    lastMessage: 'Bạn: Dạ đôi này size 42 còn kh...',
    lastTime: 'Hôm qua',
    draftPrefix: 'Bạn: ',
    messages: [
      {
        id: 'm1',
        from: 'me',
        text: 'Dạ đôi này size 42 còn không shop?',
        time: 'Hôm qua',
      },
      {
        id: 'm2',
        from: 'shop',
        text: 'Dạ shop còn size 42 nhé bạn, bạn để lại địa chỉ shop gửi liền nha.',
        time: 'Hôm qua',
      },
    ],
  },
  {
    id: 'luna-fashion',
    shopName: 'Luna Fashion',
    shopAvatar: AVATAR('Luna Fashion'),
    online: false,
    lastMessage: 'Đơn hàng của bạn đã được giao.',
    lastTime: '2 ngày trước',
    messages: [
      {
        id: 'm1',
        from: 'shop',
        text: 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã ủng hộ Luna Fashion!',
        time: '2 ngày trước',
      },
    ],
  },
  {
    id: 'home-living',
    shopName: 'Home & Living',
    shopAvatar: AVATAR('Home Living'),
    online: true,
    lastMessage: 'Bạn cho shop xin SĐT để xác nhận đơn ạ.',
    lastTime: '3 ngày trước',
    messages: [
      {
        id: 'm1',
        from: 'shop',
        text: 'Bạn cho shop xin SĐT để xác nhận đơn ạ.',
        time: '3 ngày trước',
      },
    ],
  },
];
