# Requirements Document

## Introduction

Tài liệu xác định yêu cầu chuyển lớp lưu trữ quan hệ của dự án từ PostgreSQL trên Neon sang MySQL. Phạm vi bao gồm chín microservice có database riêng, cấu hình Prisma 7, phụ thuộc runtime, truy vấn SQL viết tay, cấu hình môi trường và triển khai, dữ liệu hiện hữu, quy trình cutover, đối soát và rollback. Feature không thay đổi hợp đồng API hay hành vi nghiệp vụ quan sát được.

Khảo sát mã nguồn cho thấy thay đổi có phạm vi lớn ở tầng dữ liệu nhưng được cô lập tương đối tốt: cả chín service dùng cùng một mẫu Prisma. Rủi ro chính nằm ở tám trường scalar-list chỉ được PostgreSQL hỗ trợ, truy vấn video feed dùng cú pháp PostgreSQL và API raw không an toàn, khác biệt collation và DateTime, thiếu migration được version hóa, cùng credential PostgreSQL đang xuất hiện dạng rõ trong manifest triển khai.

## Glossary

- **PostgreSQL**: Hệ quản trị database quan hệ nguồn hiện được cung cấp qua Neon.
- **MySQL**: Hệ quản trị database quan hệ đích của feature migration.
- **Prisma**: ORM phiên bản 7.6.0 đang quản lý schema, client và truy cập database của dự án.
- **Migration_System**: Toàn bộ công cụ, cấu hình và quy trình thực hiện chuyển đổi PostgreSQL sang MySQL.
- **Database_Configuration**: Thành phần kiểm tra và cung cấp biến môi trường database cho các Service.
- **Service**: Một trong chín backend microservice: `ai-service`, `catalog-service`, `iam-service`, `order-service`, `payment-service`, `promotion-service`, `shop-service`, `utility-service`, `wallet-service`.
- **Service_Database**: Database độc lập thuộc sở hữu của một Service.
- **Source_Database**: Service_Database đang chạy trên PostgreSQL.
- **Target_Database**: Service_Database tương ứng chạy trên MySQL.
- **Source_Schema**: Prisma schema PostgreSQL hiện tại của một Service.
- **Target_Schema**: Prisma schema tương thích MySQL của một Service.
- **Prisma_Runtime**: Prisma Client và driver adapter được Service dùng khi chạy.
- **Package_Configuration**: `package.json`, lockfile và dependency graph của workspace.
- **Project_Target**: Lệnh Nx trong `project.json` dùng để generate, build hoặc đồng bộ schema.
- **Scalar_List**: Trường Prisma lưu một danh sách giá trị scalar trong một cột PostgreSQL.
- **Canonical_Record**: Biểu diễn ổn định của một bản ghi dùng để đối chiếu giá trị giữa hai database.
- **Baseline_Manifest**: Báo cáo trước migration gồm số bản ghi, aggregate, khóa và checksum theo model.
- **Validation_Report**: Báo cáo đối soát Source_Database với Target_Database.
- **Write_Freeze**: Khoảng thời gian chặn thao tác ghi vào Source_Database trong cutover.
- **Cutover**: Hoạt động chuyển traffic của Service từ Source_Database sang Target_Database.
- **Rollback**: Hoạt động đưa Service trở lại Source_Database sau cutover không đạt yêu cầu.
- **Deployment_Configuration**: Biến môi trường, Kubernetes manifest và cấu hình runtime cung cấp database URL.
- **Versioned_Migration**: Tập lệnh thay đổi schema có lịch sử, thứ tự và khả năng kiểm tra trong source control.
- **Critical_Flow**: Luồng nghiệp vụ đại diện được liệt kê tại Requirement 9.
- **Soft_Deleted_Record**: Bản ghi có `deletedAt` khác null.
- **Referential_Action**: Hành vi Cascade, SetNull hoặc NoAction của khóa ngoại.
- **Acceptance_Environment**: Môi trường MySQL tách biệt dùng để chạy kiểm thử migration và cutover.

## Repository Survey

- Chín Service đều có `prisma/schema.prisma`, `prisma.config.ts`, `src/app/prisma/prisma.service.ts` và các Project_Target `generate-prisma`, `push-prisma`, `push-prisma-acl`.
- Chín Source_Schema cùng khai báo provider `postgresql`; chín Prisma_Runtime cùng khởi tạo `PrismaPg` từ `@prisma/adapter-pg`.
- Package_Configuration dùng Prisma `7.6.0`, có PostgreSQL adapter và chưa có MySQL driver adapter.
- Tổng schema hiện tại gồm 30 model và 27 enum; repository không có file `migration.sql` được version hóa.
- Scalar_List xuất hiện tại `ReviewSummary.pros`, `ReviewSummary.cons`, `Product.images`, `User.group`, `Payment.orderId`, `Redemption.orderIds`, `Report.media`, `Review.mediaUrls`.
- Dữ liệu JSON xuất hiện tại `Product.variants`, `Product.attributes`, `Order.receiver`, `Order.timeline`, `Notification.metadata`.
- `utility-service` có truy vấn video feed dùng quoted identifier kiểu PostgreSQL, `random()`, placeholder `$1` và `$queryRawUnsafe`.
- Hai script seed danh mục nằm trong `scripts/seeder_parent_category.js` và `scripts/seeder_category.js`.
- Database URL của chín Service được truyền qua chín biến môi trường và hiện được khai báo trong Helm manifest.

## Requirements

### Requirement 1: Phạm vi chuyển đổi database

**User Story:** Là người vận hành hệ thống, tôi muốn chuyển toàn bộ database nghiệp vụ sang MySQL, để hệ thống không còn phụ thuộc vào PostgreSQL sau cutover.

#### Acceptance Criteria

1. THE Migration_System SHALL chuyển chín Service_Database tương ứng với chín Service từ PostgreSQL sang MySQL.
2. THE Migration_System SHALL duy trì quan hệ một Service sở hữu một Service_Database sau migration.
3. WHEN Cutover hoàn tất, THE Service SHALL chỉ đọc và ghi Target_Database tương ứng.
4. WHEN Cutover hoàn tất, THE Prisma_Runtime SHALL định tuyến toàn bộ kết nối database tới Target_Database tương ứng.
5. THE Migration_System SHALL giữ nguyên hợp đồng gRPC, REST và message hiện có của từng Service.

### Requirement 2: Chuyển đổi Prisma schema

**User Story:** Là lập trình viên backend, tôi muốn các Prisma schema hợp lệ với MySQL, để Prisma Client có thể được tạo và chạy cho từng Service.

#### Acceptance Criteria

1. WHEN Target_Schema được kiểm tra bằng Prisma 7.6.0, THE Target_Schema SHALL khai báo provider `mysql` và vượt qua schema validation.
2. THE Target_Schema SHALL biểu diễn đủ 30 model và 27 enum của Source_Schema.
3. THE Target_Schema SHALL bảo toàn tên trường, tính nullable, default, primary key, unique constraint, index, relation và Referential_Action của Source_Schema, ngoại trừ thay đổi Scalar_List được quy định tại tiêu chí 4.
4. THE Target_Schema SHALL cung cấp biểu diễn tương thích MySQL cho `ReviewSummary.pros`, `ReviewSummary.cons`, `Product.images`, `User.group`, `Payment.orderId`, `Redemption.orderIds`, `Report.media` và `Review.mediaUrls`.
5. THE Target_Schema SHALL bảo toàn thứ tự, số phần tử, giá trị trùng lặp và chuỗi Unicode của từng Scalar_List khi chuyển sang biểu diễn tương thích MySQL.
6. THE Target_Schema SHALL bảo toàn cấu trúc và giá trị JSON tại `Product.variants`, `Product.attributes`, `Order.receiver`, `Order.timeline` và `Notification.metadata`.
7. THE Target_Schema SHALL duy trì hành vi sinh UUID cho các khóa String và tự tăng cho `Transaction.id`.
8. THE Target_Schema SHALL dùng kiểu MySQL chứa được giới hạn độ dài đã khai báo cho các trường `VarChar` và `Text`.

### Requirement 3: Chuyển đổi Prisma runtime và package

**User Story:** Là lập trình viên backend, tôi muốn runtime và dependency dùng driver MySQL, để chín Service kết nối đúng Target_Database.

#### Acceptance Criteria

1. THE Prisma_Runtime SHALL dùng driver adapter tương thích với MySQL cho từng Service.
2. THE Package_Configuration SHALL chứa các dependency runtime cần thiết cho MySQL với phiên bản tương thích Prisma 7.6.0.
3. WHEN migration dependency hoàn tất, THE Package_Configuration SHALL loại `@prisma/adapter-pg` khỏi dependency runtime.
4. WHEN Project_Target `generate-prisma` chạy cho một Service, THE Project_Target SHALL tạo Prisma Client từ Target_Schema của Service tương ứng mà không có lỗi.
5. WHEN Project_Target `build` chạy cho chín Service, THE Project_Target SHALL hoàn tất với exit code 0.
6. WHEN Prisma_Runtime khởi động với MySQL database URL hợp lệ, THE Prisma_Runtime SHALL mở kết nối và thực hiện truy vấn health-check thành công.
7. IF Prisma_Runtime nhận database URL không dùng giao thức MySQL, THEN THE Prisma_Runtime SHALL dừng khởi động với lỗi cấu hình không chứa credential.

### Requirement 4: Quản lý schema an toàn

**User Story:** Là người vận hành hệ thống, tôi muốn thay đổi schema được version hóa, để deployment có thể kiểm tra và truy vết thay vì phụ thuộc vào thao tác đẩy schema phá hủy dữ liệu.

#### Acceptance Criteria

1. THE Migration_System SHALL tạo Versioned_Migration cho Target_Schema của từng Service.
2. WHEN Target_Schema được triển khai ngoài môi trường phát triển cục bộ, THE Migration_System SHALL áp dụng Versioned_Migration theo thứ tự đã ghi nhận.
3. IF một Versioned_Migration có thể làm mất dữ liệu, THEN THE Migration_System SHALL dừng trước khi thay đổi Target_Database và trả về trạng thái thất bại.
4. WHERE Project_Target đồng bộ schema cục bộ được giữ lại, THE Project_Target SHALL phân biệt rõ target chấp nhận mất dữ liệu với target không chấp nhận mất dữ liệu.
5. WHEN CI kiểm tra thay đổi Target_Schema, THE Migration_System SHALL xác nhận Versioned_Migration tương ứng tồn tại và hợp lệ.

### Requirement 5: Tương thích truy vấn video feed

**User Story:** Là người dùng xem video, tôi muốn video feed giữ nguyên hành vi sau migration, để trải nghiệm xem nội dung không bị thay đổi.

#### Acceptance Criteria

1. WHEN video feed được yêu cầu, THE Service SHALL chỉ trả về bản ghi `Video` có `status` bằng `READY`, `isHidden` bằng false và `deletedAt` bằng null.
2. WHEN danh sách `excludeIds` được cung cấp, THE Service SHALL loại từng ID trong `excludeIds` khỏi kết quả video feed.
3. WHEN giới hạn kết quả được cung cấp, THE Service SHALL trả về số bản ghi không vượt quá giới hạn.
4. WHEN có ít nhất hai video đủ điều kiện, THE Service SHALL dùng thứ tự ngẫu nhiên do MySQL hỗ trợ để chọn kết quả.
5. IF `excludeIds` chứa ký tự điều khiển cú pháp SQL, THEN THE Service SHALL xử lý mỗi ID như một giá trị tham số và duy trì cấu trúc câu truy vấn.
6. WHEN truy vấn video feed chạy trên Target_Database, THE Service SHALL dùng identifier, hàm xáo trộn, placeholder tham số và raw-query API tương thích MySQL.

### Requirement 6: Di chuyển và đối soát dữ liệu

**User Story:** Là chủ sở hữu dữ liệu, tôi muốn toàn bộ dữ liệu được chuyển và đối soát, để migration không làm mất hoặc làm sai dữ liệu nghiệp vụ.

#### Acceptance Criteria

1. WHEN kiểm kê trước migration bắt đầu, THE Migration_System SHALL tạo Baseline_Manifest cho từng model trong 30 model của chín Source_Database.
2. THE Baseline_Manifest SHALL ghi số bản ghi, checksum Canonical_Record, giá trị khóa nhỏ nhất, giá trị khóa lớn nhất và aggregate tài chính áp dụng cho từng model.
3. WHEN dữ liệu được chuyển, THE Migration_System SHALL sao chép cả bản ghi hoạt động và Soft_Deleted_Record sang Target_Database tương ứng.
4. WHEN Validation_Report so sánh một model, THE Validation_Report SHALL xác nhận số bản ghi Source_Database bằng số bản ghi Target_Database.
5. WHEN Validation_Report so sánh một bản ghi, THE Validation_Report SHALL xác nhận Canonical_Record của Source_Database bằng Canonical_Record của Target_Database.
6. WHEN Validation_Report kiểm tra quan hệ, THE Validation_Report SHALL xác nhận số khóa ngoại không có bản ghi cha bằng 0.
7. WHEN Validation_Report kiểm tra dữ liệu tài chính, THE Validation_Report SHALL xác nhận tổng `amount`, `balance`, `balanceAfter`, `amountIn`, `amountOut`, `accumulated`, `itemTotal`, `shippingFee`, `discount` và `grandTotal` theo model bằng Baseline_Manifest.
8. WHEN Validation_Report kiểm tra `Transaction.id`, THE Validation_Report SHALL xác nhận giá trị tự tăng tiếp theo lớn hơn giá trị `Transaction.id` lớn nhất đã chuyển.
9. WHEN Validation_Report kiểm tra DateTime, THE Validation_Report SHALL xác nhận thời điểm UTC của giá trị đích sai lệch không quá 1 mili giây so với giá trị nguồn.
10. WHEN Validation_Report kiểm tra Float, THE Validation_Report SHALL xác nhận sai số tuyệt đối không vượt quá 0.000000001.
11. WHEN Validation_Report kiểm tra Scalar_List, THE Validation_Report SHALL xác nhận danh sách đích có cùng thứ tự, số phần tử và giá trị với danh sách nguồn.
12. IF bất kỳ phép đối soát bắt buộc nào thất bại, THEN THE Migration_System SHALL chặn Cutover và xuất danh sách Service, model, khóa bản ghi và phép kiểm tra thất bại.

### Requirement 7: Bảo toàn ngữ nghĩa dữ liệu và truy vấn

**User Story:** Là lập trình viên ứng dụng, tôi muốn MySQL giữ ngữ nghĩa dữ liệu quan sát được, để các truy vấn hiện tại trả kết quả tương đương.

#### Acceptance Criteria

1. THE Target_Database SHALL dùng bộ ký tự `utf8mb4` cho dữ liệu chuỗi.
2. THE Target_Database SHALL lưu và trả về nguyên vẹn chuỗi tiếng Việt, ký tự bốn byte và chuỗi rỗng từ Source_Database.
3. THE Target_Database SHALL cấu hình collation tường minh cho các trường String tham gia unique constraint hoặc tìm kiếm.
4. WHEN truy vấn `contains` không phân biệt hoa thường chạy cho tên sản phẩm, tên shop, tên merchant, mã đơn, mã thanh toán hoặc mã và tên promotion, THE Service SHALL trả về cùng tập khóa bản ghi như Source_Database trên cùng dữ liệu.
5. WHEN lọc `User.group` theo một hoặc nhiều enum, THE Service SHALL trả về cùng tập khóa người dùng như Source_Database trên cùng dữ liệu.
6. WHEN một giá trị enum được chuyển, THE Target_Database SHALL lưu và trả về đúng enum tương ứng trong Source_Schema.
7. WHEN một giá trị JSON được chuyển, THE Target_Database SHALL bảo toàn kiểu JSON của string, number, boolean, null, array và object.
8. WHEN một Referential_Action được kích hoạt, THE Target_Database SHALL tạo kết quả Cascade, SetNull hoặc NoAction tương đương Source_Schema.
9. IF dữ liệu nguồn vi phạm giới hạn index, collation hoặc độ dài của MySQL, THEN THE Migration_System SHALL chặn Cutover và báo model, trường cùng khóa bản ghi vi phạm.

### Requirement 8: Cutover, backup và rollback

**User Story:** Là người vận hành hệ thống, tôi muốn có cutover và rollback kiểm soát được, để giảm rủi ro gián đoạn hoặc mất dữ liệu.

#### Acceptance Criteria

1. WHEN migration dữ liệu sản xuất được khởi tạo, THE Migration_System SHALL xác nhận backup có thể khôi phục tồn tại cho từng Source_Database trước lần sao chép đầu tiên.
2. WHEN kiểm tra khôi phục backup chạy trong Acceptance_Environment, THE Migration_System SHALL khôi phục thành công chín Source_Database và xác nhận số bản ghi theo Baseline_Manifest.
3. WHEN Cutover bắt đầu, THE Migration_System SHALL kích hoạt Write_Freeze trước lần đồng bộ dữ liệu cuối.
4. WHILE Write_Freeze đang hoạt động, THE Service SHALL từ chối thao tác ghi với trạng thái bảo trì xác định trước.
5. WHEN lần đồng bộ cuối hoàn tất, THE Migration_System SHALL tạo Validation_Report đạt toàn bộ kiểm tra bắt buộc trước khi chuyển traffic.
6. WHEN chín Service vượt qua kiểm tra kết nối và Critical_Flow, THE Migration_System SHALL kết thúc Write_Freeze.
7. IF Validation_Report hoặc Critical_Flow thất bại trong Cutover, THEN THE Migration_System SHALL thực hiện Rollback về Source_Database.
8. WHEN Rollback hoàn tất, THE Service SHALL đọc và ghi Source_Database mà không cần chuyển đổi dữ liệu ngược từ Target_Database.
9. THE Migration_System SHALL ghi thời điểm bắt đầu, thời điểm kết thúc, thời lượng Write_Freeze, trạng thái từng bước và người phê duyệt Cutover.

### Requirement 9: Xác nhận các luồng nghiệp vụ

**User Story:** Là chủ sản phẩm, tôi muốn các luồng nghiệp vụ cốt lõi hoạt động trên MySQL, để migration không gây hồi quy chức năng.

#### Acceptance Criteria

1. WHEN Critical_Flow của `iam-service` chạy, THE Service SHALL tạo, đọc, cập nhật và lọc User cùng Permission thành công.
2. WHEN Critical_Flow của `catalog-service` chạy, THE Service SHALL xử lý Category, Brand, Product, Attribute, SKU, quan hệ danh mục và dữ liệu JSON thành công.
3. WHEN Critical_Flow của `shop-service` chạy, THE Service SHALL xử lý đăng ký Merchant, phê duyệt Merchant và cập nhật Shop thành công.
4. WHEN Critical_Flow của `order-service` chạy, THE Service SHALL xử lý Cart, CartItem, Order, OrderItem, receiver JSON và timeline JSON thành công.
5. WHEN Critical_Flow của `payment-service` chạy, THE Service SHALL xử lý Payment, Transaction, Refund và danh sách order ID thành công.
6. WHEN Critical_Flow của `promotion-service` chạy, THE Service SHALL xử lý Promotion, Redemption, giới hạn unique và danh sách order ID thành công.
7. WHEN Critical_Flow của `utility-service` chạy, THE Service SHALL xử lý Notification, Report, Review, ReviewReply, RatingAggregate, Video và video feed thành công.
8. WHEN Critical_Flow của `wallet-service` chạy, THE Service SHALL xử lý Wallet, Credit, transaction, payout và cập nhật số dư trong transaction database thành công.
9. WHEN Critical_Flow của `ai-service` chạy, THE Service SHALL tạo và cập nhật ReviewSummary cùng danh sách ưu điểm và nhược điểm thành công.
10. WHEN hai script seed danh mục chạy qua API trên Acceptance_Environment, THE Service SHALL tạo Category và quan hệ parent-child với chuỗi tiếng Việt thành công.
11. WHEN bộ kiểm thử hồi quy chạy trên Target_Database, THE Service SHALL giữ nguyên status code, response schema và side effect nghiệp vụ đã được kiểm thử trên Source_Database.

### Requirement 10: Cấu hình triển khai và bảo mật credential

**User Story:** Là người vận hành bảo mật, tôi muốn cấu hình database đích và credential được quản lý an toàn, để Service kết nối MySQL mà không làm lộ thông tin xác thực.

#### Acceptance Criteria

1. THE Deployment_Configuration SHALL cung cấp chín MySQL database URL qua chín biến môi trường Service hiện có.
2. WHEN Database_Configuration kiểm tra biến môi trường, THE Database_Configuration SHALL xác nhận URL dùng giao thức MySQL và có tên database tương ứng với Service.
3. THE Deployment_Configuration SHALL lấy credential database từ secret store của môi trường triển khai.
4. THE Deployment_Configuration SHALL lưu duy nhất tham chiếu secret store trong file được theo dõi bởi source control.
5. WHEN Cutover được chấp nhận, THE Deployment_Configuration SHALL thu hồi credential PostgreSQL cũ khỏi workload và secret store.
6. WHEN credential từng xuất hiện dạng rõ trong source control, THE Deployment_Configuration SHALL dùng credential thay thế đã được rotate trước Cutover.
7. WHEN Service ghi log lỗi kết nối, THE Service SHALL che username, password, host query parameter và certificate material.
8. WHEN Target_Database yêu cầu TLS, THE Prisma_Runtime SHALL xác minh chứng chỉ máy chủ bằng cấu hình TLS của database URL.

### Requirement 11: Tài liệu và báo cáo phạm vi

**User Story:** Là thành viên nhóm phát triển, tôi muốn tài liệu phản ánh kiến trúc MySQL và quy trình vận hành, để nhóm có thể triển khai và xử lý sự cố nhất quán.

#### Acceptance Criteria

1. WHEN migration được triển khai, THE Migration_System SHALL cập nhật tài liệu kiến trúc để mô tả MySQL thay cho Neon PostgreSQL đối với chín Service_Database.
2. THE Migration_System SHALL cung cấp runbook cho backup, migration, validation, Cutover và Rollback.
3. THE Migration_System SHALL cung cấp ma trận ánh xạ kiểu dữ liệu cho Scalar_List, JSON, UUID, enum, DateTime, Float, Text và autoincrement.
4. THE Migration_System SHALL cung cấp danh sách file bị ảnh hưởng gồm chín Source_Schema, chín Prisma_Runtime, chín Prisma config, chín Project_Target, Package_Configuration, lockfile, raw SQL video feed, Deployment_Configuration và tài liệu kiến trúc.
5. THE Migration_System SHALL ghi rõ số lượng bản ghi thực tế của từng model trong Baseline_Manifest trước khi phê duyệt kế hoạch Cutover.
