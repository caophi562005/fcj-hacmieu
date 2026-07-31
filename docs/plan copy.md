# KẾ HOẠCH KINH DOANH SÀN THƯƠNG MẠI ĐIỆN TỬ V-SHOP

---

## 1. GIỚI THIỆU DOANH NGHIỆP
* **Tên dự án:** Sàn thương mại điện tử V-Shop.
* **Lĩnh vực:** Thương mại điện tử đa người bán (Multi-vendor E-Commerce Platform).
* **Sứ mệnh:** Cung cấp nền tảng bán hàng chi phí thấp cho nhà bán hàng (Merchant) và mang lại trải nghiệm mua sắm thông minh, minh bạch, tức thì cho người tiêu dùng nhờ ứng dụng Công nghệ AI & Thanh toán QR.

---

## 2. SẢN PHẨM / DỊCH VỤ
* **Sản phẩm/Dịch vụ cung cấp:** 
  * Nền tảng kết nối Người mua (Customer), Người bán (Seller) và Quản trị viên (Admin).
  * Cho phép người bán đăng sản phẩm, xử lý đơn hàng, xem thống kê và rút tiền.
  * Cho phép người mua tìm kiếm sản phẩm, xem video giới thiệu, thanh toán VietQR/Ví V-Xu, viết đánh giá và chat trực tuyến.
* **Điểm khác biệt (USP):**
  1. **AI Review Summary:** Tự động đọc và tóm tắt ưu/nhược điểm sản phẩm từ hàng ngàn đánh giá chỉ trong 3 giây.
  2. **Thanh toán VietQR Auto:** Quét mã QR ngân hàng tự động xác nhận đơn hàng real-time, **không mất phí gạt thẻ/trung gian**.
  3. **Hệ sinh thái Ví V-Xu:** Tích điểm, giảm giá, nâng cao tỷ lệ giữ chân người dùng.

---

## 3. PHÂN TÍCH THỊ TRƯỜNG
* **Khách hàng mục tiêu:** 
  * *Người mua:* Người tiêu dùng trẻ (18 - 35 tuổi), thích mua sắm online, hay thanh toán bằng quét mã QR và muốn tham khảo đánh giá sản phẩm nhanh chóng.
  * *Người bán:* Các chủ shop vừa và nhỏ (SMBs) muốn tối ưu chi phí hoa hồng bán hàng.
* **Nhu cầu thị trường:** Nhu cầu mua sắm online tăng trưởng 20-25%/năm; người dùng cần giải pháp thanh toán QR nhanh gọn và công cụ lọc review thật/ảo bằng AI.
* **Đối thủ cạnh tranh:** Shopee, Lazada, Tiki, TikTok Shop.
* **Lợi thế cạnh tranh của V-Shop:** Phí hoa hồng thấp hơn đối thủ (chỉ 3-5% so với 8-14%); thanh toán QR tức thì không phí trung gian; tích hợp AI tư vấn 24/7.

---

## 4. CHIẾN LƯỢC MARKETING
* **Quảng bá & Thu hút Người bán:** 
  * Chương trình *"Zero-Commission Launch"*: Miễn phí 100% hoa hồng trong 3 tháng đầu cho 500 shop đăng ký sớm.
  * Hỗ trợ kỹ thuật tạo video giới thiệu sản phẩm chất lượng cao HLS.
* **Quảng bá & Thu hút Người mua:** 
  * Chiến dịch *"Quét QR - Nhận Xu Ngay"*: Tặng V-Xu cho tài khoản mới và đơn hàng VietQR đầu tiên.
  * Quảng cáo trên Social Media (Facebook, TikTok Ads) nhấn mạnh tính năng "Tóm tắt đánh giá sản phẩm bằng AI trong 3s".
  * Game điểm danh mỗi ngày nhận V-Xu để giữ chân khách hàng (Gamification).

---

## 5. KẾ HOẠCH VẬN HÀNH
* **Công nghệ cốt lõi:**
  * Kiến trúc **Microservices** (9 service độc lập: `iam`, `catalog`, `order`, `payment`, `shop`, `wallet`, `utility`, `promotion`, `ai`).
  * Hạ tầng điện toán đám mây **AWS EKS**, gRPC speed, Neon DB, Convex Cloud (Real-time Chat & AI RAG), Groq AI API.
* **Quy trình vận hành:**
  * Duyệt shop & sản phẩm qua `admin-web` trong vòng 24h.
  * Xử lý thanh toán tự động qua SePay Webhook + SSE.
  * Xử lý video giới thiệu sản phẩm tự động qua AWS Lambda + MediaConvert.
* **Nhân sự dự kiến (Giai đoạn đầu):**
  * Đội ngũ Kỹ thuật & DevOps: 2 - 3 người (vận hành hệ thống, duy trì server).
  * Đội ngũ CSKH & Duyệt Merchant: 2 người.

---

## 6. KẾ HOẠCH TÀI CHÍNH
* **Chi phí vận hành dự kiến:**
  * Chi phí Server & AI API (AWS, Neon DB, Groq, Convex): ~$600 - $1,200 USD/tháng.
  * Chi phí Marketing & Khuyến mãi: ~$1,500 - $3,000 USD/tháng.
* **Nguồn doanh thu dự kiến:**
  1. Phí hoa hồng sàn: 3% - 5% trên mỗi đơn hàng thành công.
  2. Phí dịch vụ rút tiền (Payout): 11,000 VNĐ / lần rút.
  3. Quảng cáo đẩy bài sản phẩm (Sponsored Ads).
  4. Gói công cụ AI Seller Analytics (199,000 VNĐ/tháng).
* **Lợi nhuận dự kiến:**
  * Năm 1: Doanh thu ~$95,000 USD | Chi phí ~$90,000 USD | Lợi nhuận ~$5,000 USD.
  * Năm 2: Doanh thu ~$490,000 USD | Chi phí ~$310,000 USD | Lợi nhuận ~$180,000 USD.

---

## 7. MỤC TIÊU VÀ LỘ TRÌNH
* **Mục tiêu chính:** Hoàn vốn sau **14 - 16 tháng** vận hành chính thức; đạt 500 nhà bán hàng và 50,000 người dùng trong năm đầu tiên.
* **Lộ trình thực hiện:**
  * **Tháng 1 - 3:** Hoàn thiện kiểm thử (UAT), chạy thử nghiệm EKS Production, Onboarding 500 Merchant đầu tiên.
  * **Tháng 4 - 6:** Ra mắt công chúng (Public Launch), đẩy mạnh Marketing VietQR & V-Xu Gamification.
  * **Tháng 7 - 12:** Mở bán các gói công cụ AI cho người bán (AI Seller Analytics), tối ưu hóa lợi nhuận.
