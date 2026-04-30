const CATEGORIES = [
  'Thời Trang Nam',
  'Thời Trang Nữ',
  'Điện Thoại & Phụ Kiện',
  'Mẹ & Bé',
  'Thiết Bị Điện Tử',
  'Nhà Cửa & Đời Sống',
  'Máy Tính & Laptop',
  'Sắc Đẹp',
  'Máy Ảnh & Máy Quay Phim',
  'Sức Khỏe',
  'Đồng Hồ',
  'Giày Dép Nữ',
  'Giày Dép Nam',
  'Túi Ví Nữ',
  'Thiết Bị Điện Gia Dụng',
  'Phụ Kiện & Trang Sức Nữ',
  'Thể Thao & Du Lịch',
  'Bách Hóa Online',
  'Ô Tô & Xe Máy & Xe Đạp',
  'Nhà Sách Online',
  'Balo & Túi Ví Nam',
  'Thời Trang Trẻ Em',
  'Đồ Chơi',
  'Giặt Giũ & Chăm Sóc Nhà Cửa',
  'Chăm Sóc Thú Cưng',
  'Voucher & Dịch Vụ',
  'Dụng cụ và thiết bị tiện ích',
];

const API_URL = 'http://localhost:3300/api/v1/catalog/category';
const TOKEN = '';
async function seed() {
  console.log(
    `🚀 Đang khởi tạo ${CATEGORIES.length} danh mục bằng Native Fetch...`,
  );

  for (const name of CATEGORIES) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          name: name,
          logo: 'example.png',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ OK: ${name}`);
      } else {
        console.error(
          `❌ Lỗi API: ${name} | Status: ${response.status} | Msg: ${data.message || 'Unknown'}`,
        );
      }
    } catch (error) {
      console.error(`💥 Lỗi kết nối: ${name} | ${error.message}`);
    }
  }

  console.log('\n✨ Xong việc! Không tốn một byte cho node_modules.');
}

seed();
