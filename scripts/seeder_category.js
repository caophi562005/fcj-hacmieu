const API_URL = 'http://localhost:3300/api/v1/catalog/category';
const TOKEN = '';
// Cấu trúc dữ liệu: 27 parent categories với sub-categories tương ứng
const CATEGORY_DATA = [
  {
    // Thời Trang Nam
    parentCategoryId: '7e95a7f0-2f05-4a46-8bd9-7981e4b1eeda',
    subCategories: [
      'Áo Khoác',
      'Áo Vest và Blazer',
      'Áo Hoodie, Áo Len & Áo Nỉ',
      'Quần Jeans',
      'Quần Dài/Quần Âu',
      'Quần Short',
      'Áo',
      'Áo Ba Lỗ',
      'Đồ Lót',
      'Đồ Ngủ',
      'Đồ Bộ',
      'Vớ/Tất',
      'Trang Phục Truyền Thống',
      'Đồ Hóa Trang',
      'Trang Phục Ngành Nghề',
      'Khác',
      'Trang Sức Nam',
      'Kính Mắt Nam',
      'Thắt Lưng Nam',
      'Cà vạt & Nơ cổ',
      'Phụ Kiện Nam',
    ],
  },
  {
    // Thời Trang Nữ
    parentCategoryId: '5cc05bdd-3453-4c08-9e6f-eca60cda663e',
    subCategories: [
      'Quần',
      'Quần đùi',
      'Chân váy',
      'Quần jeans',
      'Đầm/Váy',
      'Váy cưới',
      'Đồ liền thân',
      'Áo khoác, Áo choàng & Vest',
      'Áo len & Cardigan',
      'Hoodie và Áo nỉ',
      'Bộ',
      'Đồ lót',
      'Đồ ngủ',
      'Áo',
      'Đồ tập',
      'Đồ Bầu',
      'Đồ truyền thống',
      'Đồ hóa trang',
      'Vải',
      'Vớ/ Tất',
      'Khác',
    ],
  },
  {
    // Điện Thoại & Phụ Kiện
    parentCategoryId: 'abde719c-e2f0-4c21-b9f2-72a0fc102f76',
    subCategories: [
      'Điện thoại',
      'Máy tính bảng',
      'Pin Dự Phòng',
      'Pin Gắn Trong, Cáp và Bộ Sạc',
      'Ốp lưng, bao da, Miếng dán điện thoại',
      'Bảo vệ màn hình',
      'Đế giữ điện thoại',
      'Thẻ nhớ',
      'Sim',
      'Phụ kiện khác',
      'Thiết bị khác',
    ],
  },
  {
    // Mẹ & Bé
    parentCategoryId: '4e65a3e1-bc36-4cec-89c3-7e7f8955c850',
    subCategories: [
      'Đồ dùng du lịch cho bé',
      'Đồ dùng ăn dặm cho bé',
      'Phụ kiện cho mẹ',
      'Chăm sóc sức khỏe mẹ',
      'Đồ dùng phòng tắm & Chăm sóc cơ thể bé',
      'Đồ dùng phòng ngủ cho bé',
      'An toàn cho bé',
      'Thực phẩm cho bé',
      'Chăm sóc sức khỏe bé',
      'Tã & bô em bé',
      'Đồ chơi',
      'Bộ & Gói quà tặng',
      'Khác',
      'Sữa công thức trên 24 tháng',
      'Sữa công thức 0-24 tháng tuổi',
    ],
  },
  {
    // Thiết Bị Điện Tử
    parentCategoryId: '81fd7f7f-f947-454e-9f22-72b18653e28f',
    subCategories: [
      'Phụ kiện tivi',
      'Máy Game Console',
      'Phụ kiện Console',
      'Đĩa game',
      'Linh phụ kiện',
      'Tai nghe nhét tai',
      'Loa',
      'Tivi',
      'Tivi Box',
      'Headphones',
    ],
  },
  {
    // Nhà Cửa & Đời Sống
    parentCategoryId: '8571a372-bb5e-43ef-b062-e0dea8b05548',
    subCategories: [
      'Chăn, Ga, Gối & Nệm',
      'Đồ nội thất',
      'Trang trí nhà cửa',
      'Dụng cụ & Thiết bị tiện ích',
      'Đồ dùng nhà bếp và hộp đựng thực phẩm',
      'Đèn',
      'Ngoài trời & Sân vườn',
      'Đồ dùng phòng tắm',
      'Vật phẩm thờ cúng',
      'Đồ trang trí tiệc',
      'Chăm sóc nhà cửa và giặt ủi',
      'Sắp xếp nhà cửa',
      'Dụng cụ pha chế',
      'Tinh dầu thơm phòng',
      'Đồ dùng phòng ăn',
    ],
  },
  {
    // Máy Tính & Laptop
    parentCategoryId: '839d950d-bc8a-4225-938f-d9abbe780c6f',
    subCategories: [
      'Máy Tính Bàn',
      'Màn Hình',
      'Linh Kiện Máy Tính',
      'Thiết Bị Lưu Trữ',
      'Thiết Bị Mạng',
      'Máy In, Máy Scan & Máy Chiếu',
      'Phụ Kiện Máy Tính',
      'Laptop',
      'Khác',
      'Gaming',
    ],
  },
  {
    // Sắc Đẹp
    parentCategoryId: '9818e4e1-a8c7-4fba-a2de-afc95f23ab96',
    subCategories: [
      'Chăm sóc da mặt',
      'Tắm & chăm sóc cơ thể',
      'Trang điểm',
      'Chăm sóc tóc',
      'Dụng cụ & Phụ kiện Làm đẹp',
      'Vệ sinh răng miệng',
      'Nước hoa',
      'Chăm sóc nam giới',
      'Khác',
      'Chăm sóc phụ nữ',
      'Bộ sản phẩm làm đẹp',
    ],
  },
  {
    // Máy Ảnh & Máy Quay Phim
    parentCategoryId: '1c36e426-d95a-4fa3-aa24-67fd61a15755',
    subCategories: [
      'Máy ảnh - Máy quay phim',
      'Camera giám sát & Camera hệ thống',
      'Thẻ nhớ',
      'Ống kính',
      'Phụ kiện máy ảnh',
      'Máy bay camera & Phụ kiện',
    ],
  },
  {
    // Sức Khỏe
    parentCategoryId: '5444c91d-568a-4c91-90a2-b0c71afec62e',
    subCategories: [
      'Vật tư y tế',
      'Chống muỗi & xua đuổi côn trùng',
      'Thực phẩm chức năng',
      'Tã người lớn',
      'Hỗ trợ làm đẹp',
      'Hỗ trợ tình dục',
      'Dụng cụ massage và trị liệu',
      'Khác',
    ],
  },
  {
    // Đồng Hồ
    parentCategoryId: 'd2c6cbfe-7a35-428f-ba73-f821cb683472',
    subCategories: [
      'Đồng Hồ Nam',
      'Đồng Hồ Nữ',
      'Bộ Đồng Hồ & Đồng Hồ Cặp',
      'Đồng Hồ Trẻ Em',
      'Phụ Kiện Đồng Hồ',
      'Khác',
    ],
  },
  {
    // Giày Dép Nữ
    parentCategoryId: '41008329-cf6c-4207-8381-d11d4914f007',
    subCategories: [
      'Bốt',
      'Giày Thể Thao/ Sneaker',
      'Giày Đế Bằng',
      'Giày Cao Gót',
      'Giày Đế Xuồng',
      'Xăng-đan Và Dép',
      'Phụ Kiện Giày',
      'Giày Khác',
    ],
  },
  {
    // Giày Dép Nam
    parentCategoryId: '206faf1a-ad59-48e2-adf0-e6289c96f88a',
    subCategories: [
      'Bốt',
      'Giày Thể Thao/ Sneakers',
      'Giày Sục',
      'Giày Tây Lười',
      'Giày Oxfords & Giày Buộc Dây',
      'Xăng-đan và Dép',
      'Phụ kiện giày dép',
      'Khác',
    ],
  },
  {
    // Túi Ví Nữ
    parentCategoryId: '04868fe0-6346-4c76-83db-2415a72d0a94',
    subCategories: [
      'Ba Lô Nữ',
      'Cặp Laptop',
      'Ví Dự Tiệc & Ví Cầm Tay',
      'Túi Đeo Hông & Túi Đeo Ngực',
      'Túi Tote',
      'Túi Quai Xách',
      'Túi Đeo Chéo & Túi Đeo Vai',
      'Ví/Bóp Nữ',
      'Phụ Kiện Túi',
      'Khác',
    ],
  },
  {
    // Thiết Bị Điện Gia Dụng
    parentCategoryId: 'aa744ad1-3b0e-41f5-b694-0240a5591deb',
    subCategories: [
      'Đồ gia dụng nhà bếp',
      'Đồ gia dụng lớn',
      'Máy hút bụi & Thiết bị làm sạch',
      'Quạt & Máy nóng lạnh',
      'Thiết bị chăm sóc quần áo',
      'Khác',
      'Máy xay, ép, máy đánh trứng trộn bột, máy xay thực phẩm',
      'Bếp điện',
    ],
  },
  {
    // Phụ Kiện & Trang Sức Nữ
    parentCategoryId: '8ca25b50-df8f-44cd-89d6-1fa2a852d75c',
    subCategories: [
      'Nhẫn',
      'Bông tai',
      'Khăn choàng',
      'Găng tay',
      'Phụ kiện tóc',
      'Vòng tay & Lắc tay',
      'Lắc chân',
      'Mũ',
      'Dây chuyền',
      'Kính mắt',
      'Kim loại quý',
      'Thắt lưng',
      'Cà vạt & Nơ cổ',
      'Phụ kiện thêm',
      'Bộ phụ kiện',
      'Khác',
      'Vớ/ Tất',
      'Ô/Dù',
    ],
  },
  {
    // Thể Thao & Du Lịch
    parentCategoryId: '07c5d239-5440-4164-b96f-4bf17571f662',
    subCategories: [
      'Vali',
      'Túi du lịch',
      'Phụ kiện du lịch',
      'Dụng Cụ Thể Thao & Dã Ngoại',
      'Giày Thể Thao',
      'Thời Trang Thể Thao & Dã Ngoại',
      'Phụ Kiện Thể Thao & Dã Ngoại',
      'Khác',
    ],
  },
  {
    // Bách Hóa Online
    parentCategoryId: 'df0f1c67-9810-4e4a-b0c6-b2b7aa351aa0',
    subCategories: [
      'Đồ ăn vặt',
      'Đồ chế biến sẵn',
      'Nhu yếu phẩm',
      'Nguyên liệu nấu ăn',
      'Đồ làm bánh',
      'Sữa - trứng',
      'Đồ uống',
      'Ngũ cốc & mứt',
      'Các loại bánh',
      'Đồ uống có cồn',
      'Bộ quà tặng',
      'Thực phẩm tươi sống và thực phẩm đông lạnh',
      'Khác',
    ],
  },
  {
    // Ô Tô & Xe Máy & Xe Đạp
    parentCategoryId: '5c3760ce-9380-4da0-9d9a-ed5d06da8fed',
    subCategories: [
      'Xe đạp, xe điện',
      'Mô tô, xe máy',
      'Xe Ô tô',
      'Mũ bảo hiểm',
      'Phụ kiện xe máy',
      'Phụ kiện xe đạp',
      'Phụ kiện bên trong ô tô',
      'Dầu nhớt & dầu nhờn',
      'Phụ tùng ô tô',
      'Phụ tùng xe máy',
      'Phụ kiện bên ngoài ô tô',
      'Chăm sóc ô tô',
      'Dịch vụ cho xe',
    ],
  },
  {
    // Nhà Sách Online
    parentCategoryId: '6ecfbfa4-3608-49e2-af92-17352a1b1b00',
    subCategories: [
      'Sách Tiếng Việt',
      'Sách ngoại văn',
      'Gói Quà',
      'Bút viết',
      'Dụng cụ học sinh & văn phòng',
      'Màu, Họa Cụ và Đồ Thủ Công',
      'Sổ và Giấy Các Loại',
      'Quà Lưu Niệm',
      'Nhạc cụ và phụ kiện âm nhạc',
    ],
  },
  {
    // Balo & Túi Ví Nam
    parentCategoryId: 'd59dbea7-73e0-48ce-b749-8c68044486ad',
    subCategories: [
      'Ba Lô Nam',
      'Ba Lô Laptop Nam',
      'Túi & Cặp Đựng Laptop',
      'Túi Chống Sốc Laptop Nam',
      'Túi Tote Nam',
      'Cặp Xách Công Sở Nam',
      'Ví Cầm Tay Nam',
      'Túi Đeo Hông & Túi Đeo Ngực Nam',
      'Túi Đeo Chéo Nam',
      'Bóp/Ví Nam',
      'Khác',
    ],
  },
  {
    // Thời Trang Trẻ Em
    parentCategoryId: '2c67ce37-8fd6-4c75-94ed-a486aa3aa3dd',
    subCategories: [
      'Trang phục bé trai',
      'Trang phục bé gái',
      'Giày dép bé trai',
      'Giày dép bé gái',
      'Khác',
      'Quần áo em bé',
      'Giày tập đi & Tất sơ sinh',
      'Phụ kiện trẻ em',
    ],
  },
  {
    // Đồ Chơi
    parentCategoryId: 'bcafd946-5e52-40cb-a45d-348cc7ae0141',
    subCategories: [
      'Sở thích & Sưu tầm',
      'Đồ chơi giải trí',
      'Đồ chơi giáo dục',
      'Đồ chơi cho trẻ sơ sinh & trẻ nhỏ',
      'Đồ chơi vận động & ngoài trời',
      'Búp bê & Đồ chơi nhồi bông',
    ],
  },
  {
    // Giặt Giũ & Chăm Sóc Nhà Cửa
    parentCategoryId: '2d6886e1-71c5-4d01-bf62-40182964b608',
    subCategories: [
      'Giặt giũ & Chăm sóc nhà cửa',
      'Giấy vệ sinh, khăn giấy',
      'Vệ sinh nhà cửa',
      'Vệ sinh bát đĩa',
      'Dụng cụ vệ sinh',
      'Chất khử mùi, làm thơm',
      'Thuốc diệt côn trùng',
      'Túi, màng bọc thực phẩm',
      'Bao bì, túi đựng rác',
    ],
  },
  {
    // Chăm Sóc Thú Cưng
    parentCategoryId: 'a9871777-f1e0-44b6-9d59-f54b44d2fbce',
    subCategories: [
      'Thức ăn cho thú cưng',
      'Phụ kiện cho thú cưng',
      'Vệ sinh cho thú cưng',
      'Quần áo thú cưng',
      'Chăm sóc sức khỏe',
      'Làm đẹp cho thú cưng',
      'Khác',
    ],
  },
  {
    // Voucher & Dịch Vụ
    parentCategoryId: 'eedf74ff-7bea-4dd1-a8b5-66d3620a672b',
    subCategories: [
      'Nhà hàng & Ăn uống',
      'Sự kiện & Giải trí',
      'Nạp tiền tài khoản',
      'Sức khỏe & Làm đẹp',
      'Gọi xe',
      'Khóa học',
      'Du lịch & Khách sạn',
      'Mua sắm',
      'Mã quà tặng Shopee',
      'Thanh toán hóa đơn',
      'Dịch vụ khác',
    ],
  },
  {
    // Dụng cụ và thiết bị tiện ích
    parentCategoryId: '08330884-f124-4d3d-953c-b9334da82228',
    subCategories: [
      'Dụng cụ cầm tay',
      'Dụng cụ điện và thiết bị lớn',
      'Thiết bị mạch điện',
      'Vật liệu xây dựng',
      'Thiết bị và phụ kiện xây dựng',
    ],
  },
];

async function seedSubCategories() {
  console.log(
    `🚀 Bắt đầu khởi tạo sub-categories cho ${CATEGORY_DATA.length} danh mục cha...`,
  );
  let totalSuccess = 0;

  for (const group of CATEGORY_DATA) {
    console.log(`\n📂 Đang xử lý nhóm cha: ${group.parentCategoryId}`);

    for (const subName of group.subCategories) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            name: subName,
            logo: 'example.png',
            parentCategoryId: group.parentCategoryId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log(`   ✅ Tạo thành công: ${subName}`);
          totalSuccess++;
        } else {
          console.error(
            `   ❌ Lỗi API: ${subName} | Msg: ${data.message || 'Unknown'}`,
          );
        }
      } catch (error) {
        console.error(`   💥 Lỗi kết nối khi tạo ${subName}: ${error.message}`);
      }
    }
  }

  console.log(`\n✨ Hoàn tất! Đã tạo thành công ${totalSuccess} danh mục con.`);
}

seedSubCategories();
