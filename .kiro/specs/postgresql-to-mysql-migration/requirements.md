# Requirements Document

## Introduction

Tài liệu xác định yêu cầu chuyển tầng dữ liệu quan hệ của dự án từ PostgreSQL trên Neon sang MySQL. Kết luận từ khảo sát repository: **cần sửa tương đối nhiều ở tầng dữ liệu và vận hành, nhưng phạm vi được cô lập chủ yếu trong chín backend service dùng Prisma**. Đây không phải thay đổi một dòng `provider`: chín schema và chín runtime adapter chắc chắn phải đổi; tám trường scalar-list, sáu repository dùng bộ lọc `mode: 'insensitive'`, một bộ lọc `hasSome`, một raw query PostgreSQL, dependency, schema-management target, cấu hình triển khai và tài liệu cũng cần sửa hoặc tái xác nhận. Hợp đồng REST, gRPC, message, BFF và frontend không dự kiến thay đổi nếu lớp tương thích nội bộ bảo toàn hành vi.

Feature bao gồm đánh giá tương thích, schema và data migration, cấu hình môi trường, bảo toàn hành vi ứng dụng, cutover, rollback và validation. Feature không triển khai thay đổi mã nguồn trong giai đoạn requirements.

## Glossary

- **PostgreSQL**: Hệ quản trị cơ sở dữ liệu nguồn hiện được cung cấp qua Neon.
- **MySQL**: Hệ quản trị cơ sở dữ liệu đích của feature migration.
- **Prisma**: ORM phiên bản 7.6.0 đang quản lý schema, generated client và truy cập cơ sở dữ liệu.
- **Migration_System**: Công cụ và quy trình thực hiện assessment, chuyển schema, chuyển dữ liệu, cutover và rollback.
- **Service**: Một trong chín service có cơ sở dữ liệu riêng: `ai-service`, `catalog-service`, `iam-service`, `order-service`, `payment-service`, `promotion-service`, `shop-service`, `utility-service`, `wallet-service`.
- **Service_Database**: Cơ sở dữ liệu độc lập thuộc sở hữu của một Service.
- **Source_Database**: Service_Database chạy PostgreSQL trước cutover.
- **Target_Database**: Service_Database chạy MySQL sau cutover.
- **Source_Schema**: Prisma schema PostgreSQL hiện tại của một Service.
- **Target_Schema**: Prisma schema tương thích MySQL của một Service.
- **Scalar_List**: Trường Prisma dạng danh sách scalar hiện được PostgreSQL hỗ trợ nhưng MySQL không hỗ trợ trực tiếp.
- **List_Compatibility_Layer**: Biểu diễn dữ liệu và logic ứng dụng thay thế Scalar_List trên MySQL.
- **Prisma_Runtime**: Prisma Client và database driver adapter được Service dùng khi chạy.
- **Database_Configuration**: Cấu hình dùng chung tại `libs/configurations/src/lib/database.config.ts`.
- **Deployment_Configuration**: Biến môi trường và manifest triển khai cung cấp kết nối database.
- **Package_Configuration**: `package.json`, `pnpm-lock.yaml` và dependency graph của workspace.
- **Project_Target**: Lệnh Nx trong `project.json` dùng để generate client, build, đồng bộ hoặc migrate schema.
- **Generated_Client**: Mã Prisma Client được tạo từ Target_Schema và không được chỉnh sửa thủ công.
- **Raw_Query**: Câu lệnh SQL được Service xây dựng ngoài Prisma model API.
- **CI**: Quy trình tích hợp liên tục kiểm tra schema, migration và build.
- **Secret_Store**: Dịch vụ quản lý credential mà manifest chỉ tham chiếu bằng định danh.
- **Versioned_Migration**: Thay đổi schema có thứ tự, lịch sử và khả năng áp dụng lặp lại từ source control.
- **Canonical_Record**: Biểu diễn ổn định của một bản ghi để so sánh dữ liệu nguồn và đích.
- **Baseline_Manifest**: Báo cáo trước migration chứa số bản ghi, checksum và aggregate theo model.
- **Validation_Report**: Báo cáo đối soát Source_Database với Target_Database.
- **Write_Freeze**: Trạng thái tạm dừng thao tác ghi trong lần đồng bộ cuối và quyết định cutover.
- **Cutover**: Hoạt động chuyển kết nối của Service từ Source_Database sang Target_Database.
- **Rollback**: Hoạt động khôi phục kết nối Service về Source_Database và bảo toàn dữ liệu phát sinh.
- **Critical_Flow**: Luồng nghiệp vụ đại diện được xác định tại Requirement 10.
- **Acceptance_Environment**: Môi trường MySQL tách biệt dùng để diễn tập migration, validation, cutover và rollback.
- **Approved_Cutover_Plan**: Kế hoạch được phê duyệt, chứa ngưỡng Write_Freeze, rollback, retention và tiêu chí go/no-go.
- **Repository_Assessment**: Danh mục file bắt buộc sửa, có khả năng sửa, chỉ cần tái xác nhận và ngoài phạm vi.

## Repository Assessment

- Repository có 9 `prisma/schema.prisma`, 30 model và 27 enum; toàn bộ datasource dùng `provider = "postgresql"`.
- Repository có 9 `prisma.service.ts`; toàn bộ runtime khởi tạo `PrismaPg` từ `@prisma/adapter-pg`.
- Tám Scalar_List cần thiết kế lại: `ReviewSummary.pros`, `ReviewSummary.cons`, `Product.images`, `User.group`, `Payment.orderId`, `Redemption.orderIds`, `Report.media`, `Review.mediaUrls`.
- Sáu repository chứa `mode: 'insensitive'`; `iam-service` dùng `hasSome` với `User.group`.
- `utility-service` có video-feed raw query dùng quoted identifier PostgreSQL, `random()`, placeholder `$1`, nội suy `excludeIds` và `$queryRawUnsafe`.
- Chín `project.json` chỉ có `prisma db push` và `--accept-data-loss`; repository không có lịch sử `migration.sql` được version hóa.
- Chín `prisma.config.ts` giữ được tên biến môi trường hiện tại nhưng phải được tái xác nhận với URL MySQL.
- Helm manifest đang chứa chín PostgreSQL URL và credential dạng rõ; credential hiện hữu phải được rotate, không được sao chép vào tài liệu migration.
- Các vùng chắc chắn sửa gồm 9 schema, 9 Prisma runtime, Package_Configuration, generated clients và video repository.
- Các vùng có khả năng sửa gồm repository/service sử dụng tám Scalar_List, sáu bộ lọc `mode: 'insensitive'`, `iam-service` list filter, chín Project_Target, Database_Configuration, `.env.example`, Helm manifest và README.
- Các hợp đồng REST, gRPC, message, BFF, frontend, Convex, Redis, S3 và SQS nằm ngoài thay đổi chức năng trừ khi regression test phát hiện phụ thuộc database gián tiếp.

## Requirements

### Requirement 1: Phạm vi migration và bảo toàn kiến trúc

**User Story:** Là người vận hành hệ thống, tôi muốn chuyển toàn bộ database nghiệp vụ sang MySQL, để hệ thống ngừng phụ thuộc PostgreSQL mà không thay đổi kiến trúc ownership.

#### Acceptance Criteria

1. THE Migration_System SHALL chuyển chín Service_Database từ PostgreSQL sang chín Target_Database MySQL tương ứng.
2. THE Migration_System SHALL duy trì quan hệ một Service sở hữu một Service_Database.
3. WHEN Cutover hoàn tất, THE Service SHALL đọc dữ liệu từ Target_Database tương ứng.
4. WHEN Cutover hoàn tất, THE Service SHALL ghi dữ liệu vào Target_Database tương ứng.
5. THE Migration_System SHALL giữ nguyên hợp đồng REST hiện có của Service.
6. THE Migration_System SHALL giữ nguyên hợp đồng gRPC hiện có của Service.
7. THE Migration_System SHALL giữ nguyên schema message hiện có của Service.
8. THE Migration_System SHALL giữ nguyên ranh giới transaction trong từng Service_Database.

### Requirement 2: Danh mục tác động và kiểm soát phạm vi

**User Story:** Là người lập kế hoạch migration, tôi muốn biết chính xác khu vực nào cần sửa, để ước lượng công việc và tránh bỏ sót phụ thuộc PostgreSQL.

#### Acceptance Criteria

1. THE Repository_Assessment SHALL phân loại mỗi phụ thuộc database thành bắt buộc sửa, có khả năng sửa, chỉ cần tái xác nhận hoặc ngoài phạm vi.
2. THE Repository_Assessment SHALL đánh dấu chín `prisma/schema.prisma` là bắt buộc sửa.
3. THE Repository_Assessment SHALL đánh dấu chín `src/app/prisma/prisma.service.ts` là bắt buộc sửa.
4. THE Repository_Assessment SHALL đánh dấu Package_Configuration và generated Prisma clients là bắt buộc sửa hoặc tái tạo.
5. THE Repository_Assessment SHALL đánh dấu `utility-service` video repository là bắt buộc sửa.
6. THE Repository_Assessment SHALL liệt kê mọi nơi đọc, ghi hoặc lọc tám Scalar_List là có khả năng sửa.
7. THE Repository_Assessment SHALL liệt kê sáu repository dùng `mode: 'insensitive'` là có khả năng sửa.
8. THE Repository_Assessment SHALL liệt kê chín `project.json`, Database_Configuration, `.env.example`, Helm manifest và README là có khả năng sửa.
9. WHEN implementation hoàn tất, THE Repository_Assessment SHALL không còn phụ thuộc runtime PostgreSQL ngoài artifact rollback được kiểm soát.

### Requirement 3: Tương thích Prisma schema và kiểu dữ liệu

**User Story:** Là lập trình viên backend, tôi muốn schema đích hợp lệ với MySQL, để generated client và database giữ được cấu trúc nghiệp vụ.

#### Acceptance Criteria

1. WHEN Target_Schema được kiểm tra bằng Prisma 7.6.0, THE Target_Schema SHALL khai báo datasource provider `mysql`.
2. WHEN Target_Schema được kiểm tra bằng Prisma 7.6.0, THE Target_Schema SHALL vượt qua schema validation.
3. THE Target_Schema SHALL biểu diễn đủ 30 model của Source_Schema.
4. THE Target_Schema SHALL biểu diễn đủ 27 enum của Source_Schema.
5. THE Target_Schema SHALL bảo toàn primary key của từng model.
6. THE Target_Schema SHALL bảo toàn unique constraint của từng model theo ngữ nghĩa đã phê duyệt.
7. THE Target_Schema SHALL bảo toàn index của từng model trong giới hạn index MySQL.
8. THE Target_Schema SHALL bảo toàn relation và referential action của từng model.
9. THE Target_Schema SHALL bảo toàn tính nullable và default của từng trường không thuộc Scalar_List.
10. THE Target_Schema SHALL cung cấp sức chứa không nhỏ hơn dữ liệu nguồn cho từng trường String.
11. THE Target_Schema SHALL bảo toàn UUID dạng chuỗi quan sát được qua hợp đồng Service.
12. THE Target_Schema SHALL bảo toàn hành vi autoincrement của `Transaction.id`.
13. THE Target_Schema SHALL bảo toàn kiểu JSON tại `Product.variants`, `Product.attributes`, `Order.receiver`, `Order.timeline` và `Notification.metadata`.
14. IF dữ liệu nguồn vượt giới hạn độ dài, index hoặc enum của Target_Schema, THEN THE Migration_System SHALL chặn Cutover và báo model, trường cùng khóa bản ghi.

### Requirement 4: Thay thế Scalar_List và bảo toàn API nội bộ

**User Story:** Là lập trình viên backend, tôi muốn tám Scalar_List có biểu diễn MySQL tương thích, để logic danh sách tiếp tục hoạt động.

#### Acceptance Criteria

1. THE List_Compatibility_Layer SHALL biểu diễn `ReviewSummary.pros` và `ReviewSummary.cons` trên MySQL.
2. THE List_Compatibility_Layer SHALL biểu diễn `Product.images` trên MySQL.
3. THE List_Compatibility_Layer SHALL biểu diễn `User.group` trên MySQL.
4. THE List_Compatibility_Layer SHALL biểu diễn `Payment.orderId` trên MySQL.
5. THE List_Compatibility_Layer SHALL biểu diễn `Redemption.orderIds` trên MySQL.
6. THE List_Compatibility_Layer SHALL biểu diễn `Report.media` và `Review.mediaUrls` trên MySQL.
7. WHEN một Scalar_List được chuyển đổi, THE List_Compatibility_Layer SHALL bảo toàn thứ tự phần tử.
8. WHEN một Scalar_List được chuyển đổi, THE List_Compatibility_Layer SHALL bảo toàn số lượng phần tử.
9. WHEN một Scalar_List được chuyển đổi, THE List_Compatibility_Layer SHALL bảo toàn giá trị trùng lặp.
10. WHEN một Scalar_List được chuyển đổi, THE List_Compatibility_Layer SHALL bảo toàn chuỗi rỗng và chuỗi Unicode.
11. WHEN Service đọc một danh sách sau Cutover, THE List_Compatibility_Layer SHALL trả về cùng cấu trúc mảng như trước Cutover.
12. WHEN Service ghi một danh sách sau Cutover, THE List_Compatibility_Layer SHALL lưu toàn bộ phần tử trong một transaction.
13. WHEN `User.group` được lọc theo một hoặc nhiều giá trị, THE List_Compatibility_Layer SHALL trả về cùng tập user như Source_Database trên cùng dữ liệu.
14. WHEN generated Prisma API thay đổi do List_Compatibility_Layer, THE Service SHALL điều chỉnh mọi repository và service bị ảnh hưởng mà không thay đổi hợp đồng bên ngoài.

### Requirement 5: Tương thích truy vấn và collation

**User Story:** Là người dùng ứng dụng, tôi muốn kết quả tìm kiếm và video feed không đổi, để migration không làm thay đổi hành vi quan sát được.

#### Acceptance Criteria

1. THE Target_Database SHALL dùng character set `utf8mb4` cho dữ liệu chuỗi.
2. THE Target_Database SHALL dùng collation được khai báo tường minh cho trường String tham gia tìm kiếm hoặc unique constraint.
3. WHEN truy vấn `contains` chạy cho tên product, tên shop, legal name, order code, payment code, promotion code hoặc promotion name, THE Service SHALL trả về cùng tập khóa bản ghi như Source_Database trên cùng dữ liệu.
4. WHEN unique constraint kiểm tra hai giá trị chỉ khác chữ hoa chữ thường, THE Target_Database SHALL tạo kết quả tương đương Source_Database.
5. WHEN unique constraint kiểm tra hai giá trị chỉ khác khoảng trắng cuối, THE Target_Database SHALL tạo kết quả tương đương Source_Database.
6. IF dữ liệu nguồn tạo xung đột theo collation MySQL đã chọn, THEN THE Migration_System SHALL chặn Cutover và báo constraint cùng khóa bản ghi xung đột.
7. WHEN video feed được yêu cầu, THE Service SHALL chỉ trả về `Video` có `status` bằng `READY`, `isHidden` bằng false và `deletedAt` bằng null.
8. WHEN `excludeIds` được cung cấp cho video feed, THE Service SHALL loại từng ID được cung cấp khỏi kết quả.
9. WHEN giới hạn video feed được cung cấp, THE Service SHALL trả về số bản ghi không vượt quá giới hạn.
10. WHEN có nhiều video đủ điều kiện, THE Service SHALL hỗ trợ thứ tự ngẫu nhiên bằng cú pháp tương thích MySQL.
11. WHEN raw query video feed chạy, THE Service SHALL dùng identifier và placeholder tương thích MySQL.
12. IF `excludeIds` chứa ký tự điều khiển SQL, THEN THE Service SHALL xử lý mỗi ID như một giá trị tham số.
13. WHEN source code được kiểm tra sau migration, THE Service SHALL không dùng raw-query API không an toàn cho dữ liệu do caller cung cấp.

### Requirement 6: Runtime, dependency và cấu hình môi trường

**User Story:** Là người vận hành Service, tôi muốn runtime kết nối MySQL bằng cấu hình hợp lệ, để từng Service khởi động an toàn trên database đích.

#### Acceptance Criteria

1. THE Prisma_Runtime SHALL dùng driver adapter tương thích MySQL trong chín Service.
2. THE Package_Configuration SHALL chứa dependency MySQL tương thích Prisma 7.6.0.
3. WHEN dependency migration hoàn tất, THE Package_Configuration SHALL loại `@prisma/adapter-pg` khỏi runtime dependency.
4. WHEN lockfile được tạo lại, THE Package_Configuration SHALL khóa dependency database theo dependency policy của workspace.
5. THE Deployment_Configuration SHALL tiếp tục cung cấp chín biến `*_SERVICE_DATABASE_URL` hiện có.
6. WHEN Database_Configuration nhận một database URL, THE Database_Configuration SHALL xác nhận URL dùng giao thức MySQL.
7. WHEN Database_Configuration nhận một database URL, THE Database_Configuration SHALL xác nhận URL chứa tên Service_Database tương ứng.
8. IF Database_Configuration nhận database URL không hợp lệ, THEN THE Service SHALL dừng khởi động với lỗi không chứa credential.
9. WHEN Prisma_Runtime nhận MySQL URL hợp lệ, THE Prisma_Runtime SHALL kết nối đúng Target_Database.
10. WHEN Project_Target `generate-prisma` chạy cho một Service, THE Project_Target SHALL tạo client từ Target_Schema với exit code 0.
11. WHEN build chạy cho chín Service, THE Project_Target SHALL hoàn tất với exit code 0.
12. WHEN `prisma.config.ts` được tái xác nhận, THE Migration_System SHALL ghi kết quả tương thích của schema path và biến môi trường cho từng Service.

### Requirement 7: Quản lý schema có version

**User Story:** Là người vận hành hệ thống, tôi muốn schema change được version hóa, để deployment có thể truy vết và không phụ thuộc vào lệnh đẩy schema phá hủy dữ liệu.

#### Acceptance Criteria

1. THE Migration_System SHALL tạo Versioned_Migration cho Target_Schema của từng Service.
2. WHEN Versioned_Migration được áp dụng trên Target_Database rỗng, THE Migration_System SHALL tạo schema tương đương Target_Schema.
3. WHEN Versioned_Migration được áp dụng lại trên database đã cập nhật, THE Migration_System SHALL không làm thay đổi dữ liệu nghiệp vụ.
4. WHEN Target_Schema thay đổi trong CI, THE Migration_System SHALL xác nhận Versioned_Migration tương ứng tồn tại.
5. IF Versioned_Migration có thao tác mất dữ liệu ngoài kế hoạch đã phê duyệt, THEN THE Migration_System SHALL dừng trước thao tác đó.
6. WHERE target `prisma db push` được giữ cho phát triển cục bộ, THE Project_Target SHALL phân biệt target chấp nhận mất dữ liệu với target bảo toàn dữ liệu.
7. WHEN schema được triển khai ngoài phát triển cục bộ, THE Project_Target SHALL dùng Versioned_Migration thay cho `prisma db push --accept-data-loss`.
8. THE Migration_System SHALL ghi checksum và thứ tự của mỗi Versioned_Migration đã áp dụng.

### Requirement 8: Di chuyển và đối soát dữ liệu

**User Story:** Là chủ sở hữu dữ liệu, tôi muốn dữ liệu được sao chép và đối soát, để migration không làm mất hoặc biến đổi dữ liệu nghiệp vụ.

#### Acceptance Criteria

1. WHEN kiểm kê nguồn bắt đầu, THE Migration_System SHALL tạo Baseline_Manifest cho từng model trong 30 model.
2. THE Baseline_Manifest SHALL ghi số bản ghi theo model.
3. THE Baseline_Manifest SHALL ghi checksum Canonical_Record theo model.
4. THE Baseline_Manifest SHALL ghi khóa nhỏ nhất và khóa lớn nhất theo model có thứ tự khóa.
5. THE Baseline_Manifest SHALL ghi tổng các trường tiền và số dư theo model áp dụng.
6. WHEN dữ liệu được sao chép, THE Migration_System SHALL chuyển cả bản ghi hoạt động và bản ghi có `deletedAt` khác null.
7. WHEN Validation_Report kiểm tra một model, THE Validation_Report SHALL xác nhận số bản ghi nguồn bằng số bản ghi đích.
8. WHEN Validation_Report kiểm tra một bản ghi, THE Validation_Report SHALL xác nhận Canonical_Record nguồn bằng Canonical_Record đích.
9. WHEN Validation_Report kiểm tra quan hệ, THE Validation_Report SHALL xác nhận số foreign key không có bản ghi cha bằng 0.
10. WHEN Validation_Report kiểm tra trường tiền hoặc số dư kiểu Int, THE Validation_Report SHALL xác nhận tổng nguồn bằng tổng đích.
11. WHEN Validation_Report kiểm tra Float, THE Validation_Report SHALL xác nhận sai số tuyệt đối không vượt quá `0.000000001`.
12. WHEN Validation_Report kiểm tra DateTime, THE Validation_Report SHALL xác nhận thời điểm UTC đích sai lệch không quá 1 mili giây so với nguồn.
13. WHEN Validation_Report kiểm tra JSON, THE Validation_Report SHALL xác nhận kiểu và giá trị JSON đích tương đương nguồn.
14. WHEN Validation_Report kiểm tra Scalar_List, THE Validation_Report SHALL xác nhận thứ tự, số phần tử và giá trị đích bằng nguồn.
15. WHEN Validation_Report kiểm tra `Transaction.id`, THE Validation_Report SHALL xác nhận giá trị autoincrement kế tiếp lớn hơn ID lớn nhất đã chuyển.
16. IF bất kỳ kiểm tra bắt buộc nào thất bại, THEN THE Migration_System SHALL chặn Cutover và báo Service, model, khóa bản ghi cùng kiểm tra thất bại.

### Requirement 9: Cutover, backup và rollback

**User Story:** Là người vận hành hệ thống, tôi muốn cutover và rollback được diễn tập, để sự cố không gây mất dữ liệu hoặc gián đoạn ngoài ngưỡng phê duyệt.

#### Acceptance Criteria

1. THE Approved_Cutover_Plan SHALL khai báo thời lượng Write_Freeze tối đa.
2. THE Approved_Cutover_Plan SHALL khai báo thời lượng Rollback tối đa.
3. THE Approved_Cutover_Plan SHALL khai báo thời gian giữ Source_Database sau Cutover.
4. WHEN migration production bắt đầu, THE Migration_System SHALL xác nhận backup có thể khôi phục tồn tại cho từng Source_Database.
5. WHEN restore drill chạy trong Acceptance_Environment, THE Migration_System SHALL khôi phục chín Source_Database và khớp số bản ghi với Baseline_Manifest.
6. WHEN Cutover bắt đầu, THE Migration_System SHALL kích hoạt Write_Freeze trước lần đồng bộ cuối.
7. WHILE Write_Freeze đang hoạt động, THE Service SHALL trả về trạng thái bảo trì đã định nghĩa cho thao tác ghi.
8. WHEN lần đồng bộ cuối hoàn tất, THE Migration_System SHALL tạo Validation_Report trước khi đổi kết nối.
9. WHILE quyết định go/no-go chưa hoàn tất, THE Target_Database SHALL duy trì trạng thái không nhận ghi nghiệp vụ.
10. WHEN Validation_Report và Critical_Flow đạt yêu cầu, THE Migration_System SHALL chuyển chín Service sang Target_Database.
11. IF Validation_Report hoặc Critical_Flow thất bại, THEN THE Migration_System SHALL khôi phục kết nối Source_Database trước khi kết thúc Write_Freeze.
12. IF thời lượng Write_Freeze vượt ngưỡng Approved_Cutover_Plan, THEN THE Migration_System SHALL bắt đầu Rollback.
13. WHEN Rollback trước khi mở ghi đích hoàn tất, THE Service SHALL tiếp tục ghi vào Source_Database mà không mất bản ghi.
14. IF Rollback xảy ra sau khi Target_Database đã nhận ghi, THEN THE Migration_System SHALL đồng bộ dữ liệu phát sinh về Source_Database trước khi mở ghi nguồn.
15. WHEN Rollback drill chạy trong Acceptance_Environment, THE Migration_System SHALL hoàn tất trong ngưỡng Approved_Cutover_Plan.
16. WHEN Cutover kết thúc, THE Migration_System SHALL ghi thời điểm, thời lượng, trạng thái từng bước và người phê duyệt.

### Requirement 10: Bảo toàn hành vi ứng dụng

**User Story:** Là chủ sản phẩm, tôi muốn các luồng nghiệp vụ cốt lõi hoạt động trên MySQL, để migration không gây hồi quy chức năng.

#### Acceptance Criteria

1. WHEN Critical_Flow của `iam-service` chạy, THE Service SHALL tạo, đọc, cập nhật và lọc User cùng Permission thành công.
2. WHEN Critical_Flow của `catalog-service` chạy, THE Service SHALL xử lý Category, Brand, Product, Attribute, SKU, relation và JSON thành công.
3. WHEN Critical_Flow của `shop-service` chạy, THE Service SHALL xử lý đăng ký Merchant, phê duyệt Merchant và cập nhật Shop thành công.
4. WHEN Critical_Flow của `order-service` chạy, THE Service SHALL xử lý Cart, CartItem, Order, OrderItem, receiver JSON và timeline JSON thành công.
5. WHEN Critical_Flow của `payment-service` chạy, THE Service SHALL xử lý Payment, Transaction, Refund và danh sách order ID thành công.
6. WHEN Critical_Flow của `promotion-service` chạy, THE Service SHALL xử lý Promotion, Redemption, unique constraint và danh sách order ID thành công.
7. WHEN Critical_Flow của `utility-service` chạy, THE Service SHALL xử lý Notification, Report, Review, ReviewReply, RatingAggregate, Video và video feed thành công.
8. WHEN Critical_Flow của `wallet-service` chạy, THE Service SHALL xử lý Wallet, Credit, transaction, payout và cập nhật số dư trong database transaction thành công.
9. WHEN Critical_Flow của `ai-service` chạy, THE Service SHALL tạo và cập nhật ReviewSummary cùng danh sách ưu điểm và nhược điểm thành công.
10. WHEN script seed danh mục chạy trong Acceptance_Environment, THE Service SHALL tạo Category và relation parent-child với chuỗi tiếng Việt thành công.
11. WHEN regression suite chạy trên Target_Database, THE Service SHALL giữ nguyên status code đã ghi nhận trên Source_Database.
12. WHEN regression suite chạy trên Target_Database, THE Service SHALL giữ nguyên response schema đã ghi nhận trên Source_Database.
13. WHEN regression suite chạy trên Target_Database, THE Service SHALL giữ nguyên side effect nghiệp vụ đã ghi nhận trên Source_Database.

### Requirement 11: Bảo mật credential và cấu hình triển khai

**User Story:** Là người vận hành bảo mật, tôi muốn credential database được quản lý an toàn, để migration không tiếp tục lưu bí mật trong source control.

#### Acceptance Criteria

1. THE Deployment_Configuration SHALL lấy credential MySQL từ secret store của môi trường triển khai.
2. THE Deployment_Configuration SHALL lưu duy nhất tham chiếu secret store trong file được source control theo dõi.
3. WHEN credential PostgreSQL từng xuất hiện dạng rõ trong source control, THE Deployment_Configuration SHALL dùng credential PostgreSQL thay thế đã được rotate trước migration production.
4. WHEN credential MySQL được cấp, THE Deployment_Configuration SHALL dùng credential riêng theo môi trường.
5. WHEN credential MySQL được cấp, THE Deployment_Configuration SHALL giới hạn quyền theo Service_Database tương ứng.
6. WHEN Service ghi lỗi kết nối, THE Service SHALL che username, password, query parameter bảo mật và certificate material.
7. WHEN Target_Database yêu cầu TLS, THE Prisma_Runtime SHALL xác minh chứng chỉ máy chủ.
8. WHEN Cutover được chấp nhận, THE Deployment_Configuration SHALL gỡ credential PostgreSQL khỏi workload.
9. WHEN thời gian giữ nguồn trong Approved_Cutover_Plan kết thúc, THE Deployment_Configuration SHALL thu hồi credential PostgreSQL rollback.
10. WHEN source control được quét sau migration, THE Deployment_Configuration SHALL không chứa database credential dạng rõ.

### Requirement 12: Tài liệu, bằng chứng và quyết định go/no-go

**User Story:** Là thành viên nhóm phát triển, tôi muốn có runbook và bằng chứng migration, để nhóm triển khai và xử lý sự cố nhất quán.

#### Acceptance Criteria

1. THE Migration_System SHALL cung cấp runbook cho backup và restore.
2. THE Migration_System SHALL cung cấp runbook cho schema và data migration.
3. THE Migration_System SHALL cung cấp runbook cho validation, Cutover và Rollback.
4. THE Migration_System SHALL cung cấp ma trận ánh xạ kiểu dữ liệu cho Scalar_List, JSON, UUID, enum, DateTime, Float, String và autoincrement.
5. THE Repository_Assessment SHALL ghi đường dẫn file thực tế của mọi thay đổi bắt buộc và có khả năng thay đổi.
6. WHEN migration được triển khai, THE Migration_System SHALL cập nhật README để mô tả MySQL thay cho Neon PostgreSQL.
7. WHEN rehearsal hoàn tất, THE Migration_System SHALL lưu Baseline_Manifest, Validation_Report, kết quả Critical_Flow và thời lượng Rollback.
8. IF bất kỳ bằng chứng bắt buộc nào còn thiếu, THEN THE Migration_System SHALL đặt quyết định production thành no-go.
9. IF bất kỳ credential dạng rõ nào còn trong file được theo dõi, THEN THE Migration_System SHALL đặt quyết định production thành no-go.
10. IF bất kỳ Service nào không build hoặc không kết nối Target_Database, THEN THE Migration_System SHALL đặt quyết định production thành no-go.
11. WHEN toàn bộ tiêu chí go/no-go đạt yêu cầu, THE Migration_System SHALL ghi phê duyệt production kèm người phê duyệt và thời điểm.
