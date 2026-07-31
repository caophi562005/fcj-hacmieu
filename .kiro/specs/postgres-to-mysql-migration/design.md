# Design Document

## Overview

Tài liệu thiết kế cách chuyển tầng lưu trữ quan hệ của monorepo từ PostgreSQL (Neon) sang MySQL 8.0 cho chín backend service dùng Prisma 7.6.0, đáp ứng 11 requirement trong `requirements.md`.

Nguyên tắc thiết kế xuyên suốt:

1. **Hợp đồng bên ngoài bất biến.** REST, gRPC, message payload và các zod schema trong `libs/schemas` không đổi. Trường list vẫn là `string[]` với client. Mọi thay đổi biểu diễn được hấp thụ trong tầng repository.
2. **Ưu tiên bảo toàn ngữ nghĩa hơn tối ưu.** Khi MySQL có nhiều lựa chọn, chọn lựa chọn khớp hành vi PostgreSQL hiện tại, ngay cả khi lựa chọn khác nhanh hơn.
3. **Chặn sớm hơn sửa muộn.** Mọi khác biệt không thể bảo toàn (độ dài cột, collation, index quá dài) phải bị phát hiện bởi bước precheck trước khi copy dữ liệu, không phải bởi lỗi runtime sau cutover.
4. **Không rẽ nhánh theo database.** Không có code `if (provider === 'mysql')`. Sau migration chỉ còn một đường dẫn MySQL.

### Kết quả khảo sát mã nguồn

Đã kiểm chứng trực tiếp trong repository:

| Hạng mục                                             | Số lượng                         | Trạng thái                       |
| ---------------------------------------------------- | -------------------------------- | -------------------------------- |
| `prisma/schema.prisma` với `provider = "postgresql"` | 9                                | bắt buộc sửa                     |
| `prisma.service.ts` khởi tạo `PrismaPg`              | 9                                | bắt buộc sửa                     |
| `prisma.config.ts` đọc `*_SERVICE_DATABASE_URL`      | 9                                | giữ tên biến, tái xác nhận URL   |
| `project.json` có `push-prisma` / `push-prisma-acl`  | 9                                | thay bằng versioned migration    |
| Model / enum                                         | 30 / 27                          | ánh xạ sang MySQL                |
| Trường `String[]`                                    | 8                                | thiết kế lại biểu diễn           |
| `mode: 'insensitive'`                                | 6 vị trí                         | bắt buộc bỏ, thay bằng collation |
| `hasSome` trên `User.group`                          | 1 vị trí                         | bắt buộc thiết kế lại            |
| Raw query PostgreSQL                                 | 1 (`video.repository.ts` `feed`) | bắt buộc viết lại                |
| Thư mục `prisma/migrations`                          | 0                                | phải tạo                         |
| Framework test                                       | 0                                | phải thiết lập mới               |
| Helm / Kubernetes manifest trong repo                | 0                                | xem "Giới hạn kiểm chứng"        |

Các điểm đáng chú ý phát hiện thêm trong khảo sát, chưa được nêu trong `requirements.md`:

- `datasource db` của cả chín schema **không khai báo `url`**. URL đến từ `prisma.config.ts` (CLI) và từ driver adapter (runtime). Đây là mô hình Prisma 7 và không cần đổi cấu trúc.
- `Permission` có `@@unique([path, method, group])` với `path @db.VarChar(1000)`. Trên MySQL utf8mb4 index này dài 4000+ byte, vượt giới hạn 3072 byte của InnoDB. **Đây là lỗi chặn cứng khi tạo schema, không phải rủi ro tiềm ẩn.** Chi tiết tại mục "Giới hạn độ dài index".
- 22 trường khai báo `String` không kèm `@db.*`. Trên PostgreSQL là `text` không giới hạn; trên MySQL Prisma sinh `VARCHAR(191)`. Đây là nguồn rủi ro cắt dữ liệu lớn nhất của toàn bộ migration, lớn hơn cả vấn đề scalar list.
- Có 14 khối `$transaction` chứa mẫu đọc–sửa–ghi (số dư ví, số dư credit, tồn kho SKU, cart). PostgreSQL mặc định READ COMMITTED, MySQL mặc định REPEATABLE READ. Khác biệt này ảnh hưởng tính đúng đắn, không chỉ hiệu năng.
- CI/CD (`.github/workflows/push.yml`) triển khai bằng `kubectl rollout restart` trên EKS, **không có bước nào áp dụng schema**. Việc thêm versioned migration đòi hỏi thay đổi pipeline và manifest nằm ngoài repository này.
- `Product.images` không xuất hiện trong bất kỳ file `.ts` nào của `catalog-service` (ngoài generated client). Trường này đi qua repository bằng spread của `Prisma.ProductCreateInput`. Việc đổi kiểu sẽ gây lỗi biên dịch tại điểm spread, không tại một dòng gán tường minh.

---

## Architecture

Kiến trúc không đổi: chín NestJS microservice, mỗi service sở hữu một database riêng, truy cập qua Prisma Client sinh từ schema riêng của service. Migration chỉ thay engine bên dưới và lớp adapter, không thay ranh giới service, không thay giao thức giữa các service.

```
BFF / Web  ──gRPC──▶  9 × Service  ──▶  PrismaService  ──▶  PrismaMariaDb
                                              │            (@prisma/adapter-mariadb)
                                              │                     │
                                        libs/utils                  ▼
                                        ScalarListCodec         MySQL 8.0
                                        maskDatabaseError    9 database logic
                                        libs/interceptors
                                        MaintenanceInterceptor

Đường migration, tách rời runtime, chạy một lần:
PostgreSQL (Neon) ──▶ libs/db-migration CLI ──▶ MySQL 8.0
                       precheck → inventory → copy → fix-sequence → validate
```

Điểm thay đổi kiến trúc duy nhất là `User.group`: từ một cột mảng thành bảng nối `UserGroup`, thêm một quan hệ một-nhiều trong `iam-service`. Mọi model khác giữ nguyên hình dạng quan hệ.

### Nền tảng đích

| Quyết định              | Giá trị                         | Lý do                                                                                                                                                                    |
| ----------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Engine                  | MySQL 8.0.36+                   | Cần index giảm dần (`createdAt(sort: Desc)` xuất hiện 6 lần), collation `utf8mb4_0900_*`, `JSON_ARRAY()` làm default expression, CTE. MySQL 5.7 không đủ.                |
| Row format              | `DYNAMIC` (mặc định 8.0)        | Cho phép index prefix tới 3072 byte. `COMPACT` chỉ 767 byte và sẽ làm vỡ nhiều index.                                                                                    |
| Character set           | `utf8mb4`                       | Requirement 7.1. Bắt buộc cho ký tự bốn byte.                                                                                                                            |
| Collation               | xem mục "Chiến lược collation"  | Không dùng một collation duy nhất.                                                                                                                                       |
| `transaction_isolation` | `READ-COMMITTED`                | Khớp mặc định PostgreSQL. Xem mục "Isolation level".                                                                                                                     |
| `sql_mode`              | bao gồm `STRICT_ALL_TABLES`     | Bắt buộc. Không có nó, MySQL **âm thầm cắt** chuỗi quá dài và biến giá trị sai thành warning, làm mất dữ liệu mà validation sau đó vẫn có thể qua nếu chỉ so số bản ghi. |
| Driver adapter          | `@prisma/adapter-mariadb@7.6.0` | Adapter MySQL/MariaDB chính thức của Prisma, đã kiểm chứng tồn tại đúng phiên bản 7.6.0 và bundle driver `mariadb@3.4.5`.                                                |

Hạ tầng cụ thể (RDS MySQL, Aurora MySQL, hay self-hosted trên EKS) chưa được chốt và nằm ngoài phạm vi tài liệu này; thiết kế chỉ giả định một MySQL 8.0 tương thích tiêu chuẩn với chín database logic tách biệt.

---

## Data Models

Ba mươi model và 27 enum giữ nguyên tên, trường, quan hệ và Referential_Action. Thay đổi cấu trúc dữ liệu gồm đúng ba nhóm: biểu diễn scalar list, độ dài và collation cột chuỗi, và bảng mới `UserGroup`.

### Ánh xạ trực tiếp, không rủi ro

| Prisma                                   | PostgreSQL hiện tại       | MySQL 8                        | Ghi chú                                                                                                                                                            |
| ---------------------------------------- | ------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Int`                                    | `integer`                 | `INT`                          | Trùng miền giá trị.                                                                                                                                                |
| `Float`                                  | `double precision`        | `DOUBLE`                       | Cùng IEEE 754 binary64. Sai số đối soát requirement 6.10 (1e-9) thỏa mãn tuyệt đối vì không có chuyển đổi định dạng.                                               |
| `Boolean`                                | `boolean`                 | `TINYINT(1)`                   | Prisma Client vẫn trả `boolean`. **Ngoại lệ: `$queryRaw` trả `0`/`1`.** Xem mục video feed.                                                                        |
| `DateTime`                               | `timestamp(3)`            | `DATETIME(3)`                  | Cùng độ chính xác mili giây nên requirement 6.9 (lệch ≤ 1ms) thỏa mãn chính xác, không phải xấp xỉ. `DATETIME` không lưu offset; Prisma đọc/ghi UTC ở cả hai phía. |
| `DateTime @default(now())`               | `CURRENT_TIMESTAMP`       | `DEFAULT CURRENT_TIMESTAMP(3)` | MySQL 8 cho phép nhiều cột cùng dùng, khác MySQL 5.6.                                                                                                              |
| `DateTime @updatedAt`                    | Prisma xử lý ở client     | như PostgreSQL                 | Không phụ thuộc `ON UPDATE` của MySQL.                                                                                                                             |
| `enum`                                   | native enum type          | `ENUM(...)`                    | 27 enum. Thứ tự khai báo được giữ. Thêm giá trị sau này cần `ALTER TABLE` thay vì `ALTER TYPE`.                                                                    |
| `String @id @default(uuid())`            | `text`                    | `VARCHAR(36)` (xem bên dưới)   | UUID do Prisma sinh ở client, độc lập database.                                                                                                                    |
| `Int @id @default(autoincrement())`      | `serial` / identity       | `AUTO_INCREMENT`               | Chỉ `Transaction.id`. Cần đặt lại bộ đếm sau khi copy, requirement 6.8.                                                                                            |
| Quan hệ m-n ngầm `ProductCategories`     | bảng `_ProductCategories` | bảng `_ProductCategories`      | Prisma sinh cùng tên. **Phải copy như một bảng dữ liệu độc lập**, dễ bị bỏ sót vì không phải model.                                                                |
| `onDelete: Cascade / SetNull / NoAction` | FK action                 | FK action                      | InnoDB hỗ trợ đủ. `onUpdate: NoAction` cũng hợp lệ. Requirement 7.8 thỏa mãn ở tầng engine.                                                                        |

### Ánh xạ cần can thiệp

| Vấn đề                    | PostgreSQL                                    | MySQL mặc định của Prisma                       | Quyết định                                                     |
| ------------------------- | --------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| `String` không có `@db.*` | `text`, không giới hạn                        | `VARCHAR(191)`                                  | Khai báo tường minh từng trường. Xem "Chuẩn hóa độ dài chuỗi". |
| `String @db.Text`         | `text`, không giới hạn                        | `TEXT` (65 535 **byte** ≈ 16 383 ký tự utf8mb4) | Nâng lên `MediumText` cho các trường có thể chứa nội dung dài. |
| `Json`                    | `jsonb`                                       | `JSON`                                          | Xem "Khác biệt JSON".                                          |
| `String[]`                | mảng native                                   | không tồn tại                                   | Xem "Thiết kế lại scalar list".                                |
| Index trên cột dài        | không giới hạn thực tế                        | 3072 byte / index                               | Xem "Giới hạn độ dài index".                                   |
| So sánh chuỗi             | phân biệt hoa thường, `ILIKE` để bỏ phân biệt | phụ thuộc collation cột                         | Xem "Chiến lược collation".                                    |

### Chuẩn hóa độ dài chuỗi

Đây là rủi ro nghiêm trọng nhất và ít hiển hiện nhất. Trên PostgreSQL, `String` không có annotation là `text`, chứa được nội dung dài bất kỳ. Prisma sinh `VARCHAR(191)` cho MySQL. Với `sql_mode` lỏng, MySQL cắt âm thầm; với `STRICT_ALL_TABLES`, insert thất bại. Cả hai đều không chấp nhận được.

Quy tắc quyết định, áp dụng cho từng trường `String` chưa có `@db.*`:

| Nhóm                        | Trường tiêu biểu                                                                                                                                                                                                                                                                                      | Quyết định          | Lý do                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Khóa và khóa ngoại UUID     | `id`, `productId`, `userId`, `shopId`, `orderId`, `skuId`, `cartId`, `walletId`, `creditId`, `promotionId`, `merchantId`, `reviewId`, `createdById`, `updatedById`, `deletedById`, `uploadedById`, `assigneeAdminId`, `reporterId`, `targetId`, `referenceId`, `orderItemId`, `sellerId`, `paymentId` | `@db.VarChar(36)`   | UUID v4 luôn 36 ký tự. Giảm index từ 764 byte xuống 144 byte, giải phóng phần lớn áp lực giới hạn 3072 byte và giảm rõ kích thước index. |
| Mã sinh bởi hệ thống        | `Order.code`, `Payment.code`, `Promotion.code`, `Redemption.code`                                                                                                                                                                                                                                     | `@db.VarChar(64)`   | Cần xác nhận bằng truy vấn `MAX(LENGTH())` trên dữ liệu thật trước khi chốt.                                                             |
| Tên hiển thị ngắn           | `Product.name`, `Promotion.name`, `Order.code`, `OrderItem.productName`, `CartItem.productName`, `SKU.value`                                                                                                                                                                                          | `@db.VarChar(500)`  | Đủ rộng, vẫn index được.                                                                                                                 |
| Địa danh                    | `provinceName`, `districtName`, `wardName`                                                                                                                                                                                                                                                            | `@db.VarChar(255)`  |                                                                                                                                          |
| Địa chỉ, mô tả ngắn         | `User.address`, `Shop.pickupAddress`, `Shop.returnAddress`, `PayoutRequest.note`, `PayoutRequest.rejectReason`, `WalletTransaction.description`, `CreditTransaction.description`, `Promotion.description`                                                                                             | `@db.VarChar(1000)` |                                                                                                                                          |
| URL ảnh                     | `SKU.image`, `Attribute.url`, `OrderItem.productImage`, `CartItem.productImage`                                                                                                                                                                                                                       | `@db.VarChar(1000)` | Khớp quy ước sẵn có của các cột URL đã annotate.                                                                                         |
| Nội dung có thể rất dài     | `Product.description`, `Product.sizeGuide`, `Transaction.body`, `Transaction.transactionContent`                                                                                                                                                                                                      | `@db.MediumText`    | Mô tả sản phẩm có HTML dễ vượt 64 KB. Body webhook thanh toán cũng vậy. Nâng cấp này rẻ và loại bỏ một lớp rủi ro.                       |
| Tóm tắt AI                  | `ReviewSummary.summary`                                                                                                                                                                                                                                                                               | `@db.VarChar(2000)` | Prompt giới hạn 1–2 câu, nhưng 191 ký tự chắc chắn không đủ cho tiếng Việt.                                                              |
| Tên ngân hàng, số tài khoản | `PayoutRequest.bankName`, `accountNumber`, `accountHolder`                                                                                                                                                                                                                                            | `@db.VarChar(255)`  |                                                                                                                                          |

Quyết định độ dài không được suy đoán. Bước `precheck` (mục "Công cụ migration") chạy `SELECT MAX(CHAR_LENGTH(col)) FROM tbl` cho từng cột trên PostgreSQL và **chặn migration nếu giá trị thực tế vượt độ dài đích đã chọn** (requirement 7.9). Bảng trên là giá trị khởi điểm, được chốt lại bằng số liệu.

### Khác biệt JSON

`jsonb` và `JSON` của MySQL đều chuẩn hóa: bỏ khóa trùng, không giữ khoảng trắng, không giữ thứ tự khóa gốc. Do đó requirement 6.7 (bảo toàn kiểu string, number, boolean, null, array, object) và requirement 2.6 (bảo toàn cấu trúc và giá trị) đều thỏa mãn, nhưng phép so sánh trong Validation_Report **không được so chuỗi thô**, phải so sau khi canonicalize cả hai phía.

Ba khác biệt cần xử lý:

1. **Thứ tự khóa khác nhau.** `jsonb` sắp theo độ dài rồi lexicographic; MySQL cũng sắp nhưng không đảm bảo trùng khớp quy tắc. Canonical_Record sắp khóa đệ quy trước khi băm.
2. **Số nguyên lớn và số thực.** `jsonb` giữ `numeric` với độ chính xác tùy ý; MySQL JSON quy về `INT64` hoặc `DOUBLE`. Dữ liệu hiện tại (`Variants`, `Attributes`, `Receiver`, `Timeline`, `Metadata`) chỉ chứa chuỗi, số nhỏ và boolean nên không bị ảnh hưởng, nhưng `precheck` phải xác nhận: chặn nếu tồn tại số nguyên vượt `2^53` hoặc số thực có hơn 17 chữ số nghĩa.
3. **DEFAULT cho cột JSON.** `Report.media` và `Review.mediaUrls` hiện có `@default([])`. MySQL chỉ nhận default cho JSON dưới dạng biểu thức `(JSON_ARRAY())`. Thiết kế **không dùng default ở tầng database**: cột khai báo `Json` non-null, giá trị mặc định do `ScalarListCodec` cấp ở tầng ứng dụng. Lý do: hành vi default JSON của MySQL không đồng nhất giữa các bản minor và Prisma từng sinh SQL không tương thích; đẩy lên tầng ứng dụng khiến hành vi xác định và test được.

### Giới hạn độ dài index

InnoDB với row format `DYNAMIC` giới hạn mỗi index key 3072 byte. Trong utf8mb4 mỗi ký tự chiếm tối đa 4 byte, nên `VARCHAR(n)` tốn `4n` byte trong index.

Kiểm tra toàn bộ index và unique constraint hiện có, sau khi áp dụng chuẩn hóa độ dài ở trên:

| Constraint                                                  | Byte trước chuẩn hóa    | Byte sau chuẩn hóa  | Kết luận                      |
| ----------------------------------------------------------- | ----------------------- | ------------------- | ----------------------------- |
| `Permission.@@unique([path, method, group])`                | 4000 + 2 + 2 = **4004** | cần xử lý riêng     | **Vượt giới hạn. Chặn cứng.** |
| `SKU.@@unique([productId, value])`                          | 764 + 2000 = **2764**   | 144 + 2000 = 2144   | An toàn                       |
| `CartItem.@@unique([cartId, productId, skuId])`             | 764 × 3 = 2292          | 144 × 3 = 432       | An toàn                       |
| `CreditTransaction.@@unique([shopId, source, referenceId])` | 764 + 2 + 764 = 1530    | 144 + 2 + 144 = 290 | An toàn                       |
| `Review.@@unique([userId, orderItemId])`                    | 1528                    | 288                 | An toàn                       |
| `Redemption.@@unique([code, userId])`                       | 1528                    | 256 + 144 = 400     | An toàn                       |
| `Brand.@@unique([name])`                                    | 2000                    | 2000                | An toàn                       |
| `Category.@@index([name])`                                  | 2000                    | 2000                | An toàn                       |
| `Attribute.@@unique([name])`                                | 1020                    | 1020                | An toàn                       |
| `User.@@unique([email, deletedAt])`                         | 764 + 6                 | 1020 + 6            | An toàn                       |
| Các index còn lại                                           | < 1600                  | < 1600              | An toàn                       |

**Xử lý `Permission`:** ba phương án được xem xét.

| Phương án                                                                         | Đánh giá                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prefix index `@@unique([path(length: 500), method, group])`                       | Bị loại. Prisma hỗ trợ cú pháp này cho MySQL, nhưng uniqueness khi đó áp trên 500 ký tự đầu, khác ngữ nghĩa PostgreSQL. Vi phạm nguyên tắc bảo toàn ngữ nghĩa.                                                       |
| Cột hash sinh tự động `pathHash CHAR(64)` + `@@unique([pathHash, method, group])` | Bảo toàn ngữ nghĩa tuyệt đối, nhưng thêm cột, thêm logic ghi, và làm lệch schema khỏi Source_Schema nhiều nhất.                                                                                                      |
| **Giảm `path` xuống `@db.VarChar(500)`**                                          | **Được chọn.** 2000 + 4 byte, an toàn. Route path HTTP dài quá 500 ký tự không tồn tại trong thực tế. Bước `precheck` xác nhận `MAX(CHAR_LENGTH(path))` trên dữ liệu thật; nếu vượt 500, chuyển sang phương án hash. |

Quyết định này bị chặn bởi dữ liệu: nếu precheck báo vượt, thiết kế chuyển sang phương án hash mà không cần phê duyệt lại.

### Isolation level

PostgreSQL mặc định READ COMMITTED. MySQL InnoDB mặc định REPEATABLE READ. Repository có 14 khối `$transaction`, trong đó các khối sau là đọc–sửa–ghi trên giá trị tiền hoặc tồn kho:

- `wallet-service`: `wallet.repository.adjust`, `credit.repository.adjust`, `payout.repository.create`, `payout.repository.updateStatus`, `payout.repository.delete`
- `catalog-service`: `sku.repository.increaseStock`
- `order-service`: `cart-item.repository.add` / `update` / `delete`, `order.repository.cancel`
- `promotion-service`: `redemption.repository.createFromOrder`

Dưới REPEATABLE READ, một transaction đọc số dư rồi ghi số dư mới sẽ thấy snapshot cũ trong suốt transaction, và MySQL dùng gap lock rộng hơn PostgreSQL, tạo mẫu deadlock khác. Kết quả là cùng một đoạn code có thể mất cập nhật hoặc deadlock trên MySQL dù đúng trên PostgreSQL.

Quyết định: đặt `transaction_isolation = 'READ-COMMITTED'` ở cấp server MySQL cho cả chín database. Lý do chọn cấp server thay vì cấp session: adapter `@prisma/adapter-mariadb` dùng connection pool, việc set session variable trên từng connection không được Prisma đảm bảo và dễ trôi. Đặt ở server là bất biến, kiểm tra được bằng một health-check query.

Thiết kế **không** viết lại các transaction sang `SELECT ... FOR UPDATE` trong phạm vi migration này. Lý do: đó là thay đổi hành vi concurrency vượt phạm vi requirement 1.5 (giữ nguyên hợp đồng và hành vi). Nếu kiểm thử tải trong Acceptance_Environment phát hiện mất cập nhật ngay cả dưới READ COMMITTED, đó là lỗi đồng thời đã tồn tại từ trước và được ghi nhận thành hạng mục riêng.

---

## Thiết kế lại scalar list

Tám trường `String[]` không có tương đương trên MySQL. Ba phương án biểu diễn:

| Phương án            | Bảo toàn thứ tự và trùng lặp | Truy vấn theo phần tử             | Type safety             | Chi phí sửa code                  |
| -------------------- | ---------------------------- | --------------------------------- | ----------------------- | --------------------------------- |
| Cột `Json` chứa mảng | Có                           | Chỉ qua `JSON_CONTAINS` / raw SQL | Mất, `Prisma.JsonValue` | Thấp, tập trung ở repository      |
| Bảng con chuẩn hóa   | Có, nếu thêm cột `position`  | Có, index được                    | Đầy đủ                  | Cao                               |
| Chuỗi phân tách      | Có                           | Không đáng tin                    | Không                   | Thấp nhưng rất dễ sai với Unicode |

Chuỗi phân tách bị loại ngay: bất kỳ ký tự phân tách nào cũng có thể xuất hiện trong URL hoặc văn bản tiếng Việt do AI sinh, vi phạm requirement 2.5.

Quyết định là **theo từng trường, dựa trên trường đó có bị truy vấn theo phần tử hay không**. Khảo sát cho thấy chỉ một trong tám trường bị truy vấn theo phần tử.

### Nhóm A — cột `Json` (7 trường)

`ReviewSummary.pros`, `ReviewSummary.cons`, `Product.images`, `Report.media`, `Review.mediaUrls`, `Redemption.orderIds`, `Payment.orderId`.

Căn cứ kiểm chứng: đã grep toàn bộ `apps/services/**/*.ts` (loại trừ generated client) cho `hasSome`, `hasEvery`, `has:`, `isEmpty:` — **không có kết quả nào**. Bảy trường này chỉ được ghi toàn bộ mảng, đọc toàn bộ mảng, hoặc xử lý bằng JavaScript sau khi đọc:

- `redemption.repository`: đọc `existing.orderIds` rồi so sánh và hợp nhất bằng `Set` trong JavaScript.
- `transaction.service`: chỉ kiểm tra `payment.orderId?.length > 0`.
- `review-summary.repository`: ghi toàn bộ `pros` / `cons` trong `upsert`.
- `review.repository`: ghi toàn bộ `mediaUrls` trong `update`.

Vì không có truy vấn theo phần tử, `Json` là lựa chọn đủ và ít xâm lấn nhất.

Hệ quả cần xử lý: `Payment` hiện có `@@index([orderId])` trên cột mảng. MySQL không index trực tiếp cột JSON. Vì không tồn tại truy vấn nào lọc `Payment` theo `orderId`, index này **được bỏ** và ghi lại trong ma trận ánh xạ. Nếu sau này cần lọc, phương án là generated column + functional index, không phải quay lại mảng.

**Lớp `ScalarListCodec`.** Đặt tại `libs/utils/src/lib/scalar-list.util.ts`, dùng chung cho cả bảy trường:

```ts
// Đọc: Prisma.JsonValue -> string[]
export function readStringList(value: Prisma.JsonValue | null | undefined): string[];

// Ghi: string[] -> Prisma.InputJsonValue
export function writeStringList(value: readonly string[] | null | undefined): Prisma.InputJsonValue;
```

Hành vi bắt buộc, ràng buộc trực tiếp requirement 2.5:

- `readStringList` trả `[]` cho `null`, `undefined`, hoặc mảng rỗng.
- `readStringList` ném lỗi có ngữ cảnh nếu giá trị không phải mảng chuỗi. Không âm thầm trả `[]`, vì dữ liệu sai kiểu là dấu hiệu hỏng dữ liệu cần dừng lại.
- `writeStringList` giữ nguyên thứ tự, giữ phần tử trùng lặp, không trim, không normalize Unicode. Bất kỳ chuẩn hóa nào cũng làm hỏng phép đối soát requirement 6.11.
- Round-trip là identity: `readStringList(writeStringList(x))` sâu bằng `x` với mọi `x: string[]`.

Tập trung logic vào một hàm thay vì rải rác cho phép kiểm thử tính chất một lần và đảm bảo bảy trường hành xử giống nhau.

**Điểm phải sửa trong code ứng dụng:**

| File                                                             | Thay đổi                                                                                                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/services/ai-service/.../review-summary.repository.ts`      | `upsert`: bọc `pros`, `cons` bằng `writeStringList` ở cả `create` và `update`                                                                                      |
| `apps/services/ai-service/.../review-summary-grpc.controller.ts` | Map kết quả đọc qua `readStringList` trước khi trả response (hiện trả trực tiếp)                                                                                   |
| `apps/services/utility-service/.../review.repository.ts`         | `update`: bọc `mediaUrls`; mọi hàm đọc Review phải map ngược                                                                                                       |
| `apps/services/utility-service/.../report.repository.ts`         | Tương tự cho `media`                                                                                                                                               |
| `apps/services/promotion-service/.../redemption.repository.ts`   | `orderIds` xuất hiện tại 5 vị trí: so sánh tập, hợp nhất, `create`, `update`, khởi tạo `[]`. Đọc qua `readStringList` trước khi so sánh, ghi qua `writeStringList` |
| `apps/services/payment-service/.../payment.repository.ts`        | `create` nhận `Prisma.PaymentCreateInput` spread; cần map `orderId`                                                                                                |
| `apps/services/payment-service/.../transaction.service.ts`       | `payment.orderId?.length` trở thành `readStringList(payment.orderId).length`                                                                                       |
| `apps/services/catalog-service/.../product.repository.ts`        | `Product.images` đi qua spread `Prisma.ProductCreateInput`; cần map tường minh ở `create` và `update`, và map ngược ở mọi hàm đọc (`list`, `getOne`, `findById`)   |

`libs/schemas` và `libs/interfaces` **không đổi**: `ProductSchema.images` vẫn là `z.array(z.string())`, `ReviewSchema.mediaUrls` vẫn là `z.array(z.string().url())`, `PromotionRedemptionSchema.orderIds` vẫn là `z.array(z.uuid())`. Đây là điểm quan trọng: hợp đồng gRPC trong `libs/interfaces/src/lib/proto-types/catalog.ts` khai báo `images: string[]` và giữ nguyên, thỏa requirement 1.5.

### Nhóm B — bảng con (1 trường)

`User.group GROUP[]`.

Đây là trường duy nhất bị truy vấn theo phần tử. `apps/services/iam-service/.../user.repository.ts` dùng:

```ts
group: data?.group?.length ? { hasSome: data.group } : undefined;
```

Phương án `Json` sẽ buộc thay `hasSome` bằng raw SQL `JSON_OVERLAPS`, mất type safety và mất index. Đó là đánh đổi tệ cho một bộ lọc phân quyền chạy trên đường dẫn danh sách người dùng.

Quyết định: bảng nối `UserGroup`.

```prisma
model UserGroup {
    userId String @db.VarChar(36)
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
    group  GROUP

    @@id([userId, group])
    @@index([group])
}
```

Ghi chú thiết kế:

- Khóa chính tổ hợp `(userId, group)` phản ánh đúng ngữ nghĩa tập hợp: một người dùng không thể thuộc cùng một group hai lần. PostgreSQL hiện tại **không** ràng buộc điều này (mảng cho phép trùng), nên đây là siết chặt nhẹ. Chấp nhận được vì `GROUP` là tập hợp quyền, và `user.service.update` đã dùng phép trừ tập hợp. Bước `precheck` xác nhận không có `User.group` nào chứa phần tử trùng trước khi copy; nếu có, dữ liệu được deduplicate và ghi vào Validation_Report như một sai lệch có chủ đích được phê duyệt.
- Không thêm cột `position`. `GROUP` là tập hợp, thứ tự không có ngữ nghĩa trong code hiện tại (`hasSome`, phép trừ tập hợp, `includes`). Đây là ngoại lệ có ý thức với requirement 2.5, được nêu rõ để phê duyệt: **thứ tự của `User.group` không được bảo toàn**; nếu yêu cầu bắt buộc bảo toàn, thêm cột `position Int` và sắp xếp khi đọc.
- `onDelete: Cascade` đảm bảo xóa cứng User không để lại orphan.

**Điểm phải sửa:**

| File                                      | Thay đổi                                                                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user.repository.ts` `list`               | `{ hasSome: data.group }` → `{ groups: { some: { group: { in: data.group } } } }`                                                                    |
| `user.repository.ts` `find` / `list`      | Thêm `include: { groups: { select: { group: true } } }`, map về `string[]` khi trả                                                                   |
| `user.repository.ts` `create`             | `group: [...]` → `groups: { create: data.group.map(group => ({ group })) }`                                                                          |
| `user.repository.ts` `update`             | Cập nhật tập hợp bằng `deleteMany` + `createMany` trong một transaction, không dùng `set`                                                            |
| `user.service.ts` `update`                | `oldUser.group` → `oldUser.groups.map(g => g.group)`. Logic diff Cognito (`groupsToAdd`, `groupsToRemove`) giữ nguyên vì đã làm việc trên `string[]` |
| `user-consumer.service.ts`                | `group: [GroupValues.CUSTOMER]` → nested create                                                                                                      |
| `libs/schemas/src/lib/iam/user.schema.ts` | **Không đổi.** `group: z.array(GroupEnums)` vẫn là hợp đồng                                                                                          |

Việc `UserSchema.group` không đổi có nghĩa mọi hàm đọc User phải làm phẳng `groups[].group` về `group: string[]`. Để tránh bỏ sót, thêm một mapper duy nhất `toUserResponse(row)` trong `user.repository.ts` và bắt buộc mọi hàm đọc đi qua nó.

`Permission.group GROUP` là scalar đơn, không phải mảng, và không bị ảnh hưởng.

---

## Chiến lược collation

Đây là phần dễ bị làm sai nhất vì MySQL trộn hai khái niệm mà PostgreSQL tách rời: so sánh để tìm kiếm, và so sánh để bảo đảm tính duy nhất.

### Vấn đề

Prisma **không hỗ trợ `mode: 'insensitive'` cho provider `mysql`**. Sáu vị trí sau sẽ không biên dịch được và bắt buộc phải bỏ tham số `mode`:

| File                                                  | Trường                             |
| ----------------------------------------------------- | ---------------------------------- |
| `catalog-service/.../product.repository.ts:419`       | `Product.name`                     |
| `order-service/.../order.repository.ts:30`            | `Order.code`                       |
| `payment-service/.../payment.repository.ts:27`        | `Payment.code`                     |
| `promotion-service/.../promotion.repository.ts:29,32` | `Promotion.code`, `Promotion.name` |
| `shop-service/.../shop.repository.ts:29`              | `Shop.name`                        |
| `shop-service/.../merchant.repository.ts:29`          | `Merchant.legalName`               |

Sau khi bỏ `mode`, `contains` trở thành `LIKE '%...%'` và tính phân biệt hoa thường **do collation của cột quyết định**. Đây là cách duy nhất để đạt requirement 7.4.

Nhưng collation cũng quyết định tính duy nhất. `utf8mb4_0900_ai_ci` bỏ phân biệt hoa thường **và bỏ phân biệt dấu**. Trên PostgreSQL, `ILIKE` bỏ phân biệt hoa thường nhưng **giữ phân biệt dấu**: `'Cà phê' ILIKE '%ca phe%'` là false. Với `ai_ci` thì là true. Đó là thay đổi hành vi thật với dữ liệu tiếng Việt, vi phạm requirement 7.4 nếu chọn bừa.

### Quyết định

Không dùng một collation duy nhất. Dùng hai, gán tường minh bằng `@db.VarChar(n)` kết hợp `@@map` collation ở tầng migration SQL:

| Nhóm cột                     | Collation            | Ngữ nghĩa đạt được                                                                 | Áp dụng cho                                                                                                                                |
| ---------------------------- | -------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Cột tìm kiếm bằng `contains` | `utf8mb4_0900_as_ci` | Phân biệt dấu, bỏ phân biệt hoa thường. **Khớp chính xác `ILIKE` của PostgreSQL.** | `Product.name`, `Shop.name`, `Merchant.legalName`, `Promotion.name`, `Order.code`, `Payment.code`, `Promotion.code`                        |
| Cột định danh và khóa        | `utf8mb4_0900_as_cs` | Phân biệt dấu và hoa thường. Khớp so sánh mặc định của PostgreSQL.                 | Toàn bộ `id`, khóa ngoại, `User.email`, `User.username`, `Brand.name`, `Attribute.name`, `SKU.value`, `Permission.path`, `Redemption.code` |
| Còn lại                      | `utf8mb4_0900_as_cs` | Mặc định của database, an toàn nhất                                                | Mọi cột chuỗi khác                                                                                                                         |

Collation mặc định của cả chín database đặt là `utf8mb4_0900_as_cs`; chỉ bảy cột tìm kiếm được ghi đè sang `as_ci`.

### Hệ quả và cách xử lý

**Xung đột duy nhất/tìm kiếm trên cột `code`.** `Order.code`, `Payment.code`, `Promotion.code` vừa có unique constraint, vừa bị `contains` không phân biệt hoa thường. Đặt `as_ci` làm uniqueness trở thành không phân biệt hoa thường, chặt hơn PostgreSQL. Rủi ro thực tế: nếu tồn tại hai mã chỉ khác nhau hoa thường, migration sẽ thất bại khi tạo unique index.

Xử lý: bước `precheck` chạy cho từng cột unique bị đổi sang `as_ci`:

```sql
SELECT LOWER(code), COUNT(*) FROM "Order" GROUP BY LOWER(code) HAVING COUNT(*) > 1;
```

Nếu trả về bất kỳ dòng nào, chặn Cutover và báo model, cột, giá trị (requirement 7.9). Mã hiện do hệ thống sinh nên khả năng xung đột gần bằng không, nhưng phải chứng minh bằng dữ liệu chứ không bằng giả định.

**Không trộn collation trong phép so sánh.** MySQL báo lỗi `Illegal mix of collations` khi so sánh hai cột khác collation. Ràng buộc thiết kế: **toàn bộ cột khóa và khóa ngoại dùng cùng một collation `as_cs`**. Bảy cột `as_ci` đều không tham gia join hay FK, đã kiểm chứng trên schema. Migration SQL phải khai báo collation tường minh trên từng cột, không dựa vào kế thừa từ table, để tránh trôi khi có `ALTER TABLE` sau này.

**`User.email` không đổi sang `as_ci`.** Trên PostgreSQL, `email` unique phân biệt hoa thường và không bị `contains` không phân biệt hoa thường. Giữ `as_cs` là bảo toàn ngữ nghĩa. Nếu nghiệp vụ muốn email không phân biệt hoa thường, đó là thay đổi tính năng riêng, không thuộc migration.

**Không dùng `utf8mb4_general_ci`.** Đây là collation kế thừa từ MySQL 5.x, xử lý Unicode sai với nhiều ký tự và không tuân UCA. Ràng buộc: chỉ dùng họ `utf8mb4_0900_*`.

---

## Thiết kế lại truy vấn video feed

### Trạng thái hiện tại

`apps/services/utility-service/src/app/modules/video/repositories/video.repository.ts`:

```ts
const videos = await this.prismaService.$queryRawUnsafe<any[]>(
  `SELECT * FROM "Video"
   WHERE status = 'READY' AND "isHidden" = false AND "deletedAt" IS NULL
   ${data.excludeIds?.length ? `AND id NOT IN (${data.excludeIds.map((id) => `'${id}'`).join(',')})` : ''}
   ORDER BY random()
   LIMIT $1`,
  data.limit,
);
```

Bốn vấn đề, ba trong đó độc lập với việc đổi database:

1. **SQL injection.** `excludeIds` được nội suy trực tiếp vào chuỗi SQL, chỉ bọc dấu nháy đơn mà không escape. Một ID chứa `'` sẽ phá cấu trúc câu truy vấn. Requirement 5.5 yêu cầu tham số hóa.
2. Identifier trích dẫn kiểu PostgreSQL `"Video"`, `"isHidden"` — MySQL dùng backtick.
3. `random()` — MySQL dùng `RAND()`.
4. `$queryRawUnsafe` bỏ hoàn toàn khả năng kiểm tra kiểu.

### Quyết định: bỏ raw SQL

Thay bằng hai lần gọi Prisma có kiểu, không còn SQL viết tay:

```ts
private static readonly MAX_FEED_LIMIT = 50;

async feed(data: { limit: number; excludeIds?: string[] }) {
  const limit = Math.min(Math.max(data.limit, 1), VideoRepository.MAX_FEED_LIMIT);
  const excludeIds = data.excludeIds ?? [];

  const where: Prisma.VideoWhereInput = {
    status: VideoStatus.READY,
    isHidden: false,
    deletedAt: null,
    ...(excludeIds.length > 0 && { id: { notIn: excludeIds } }),
  };

  const candidates = await this.prismaService.video.findMany({
    where,
    select: { id: true },
  });

  if (candidates.length === 0) return [];

  const picked = shuffle(candidates.map((c) => c.id)).slice(0, limit);

  const videos = await this.prismaService.video.findMany({
    where: { id: { in: picked } },
  });

  return shuffle(videos);
}
```

Lý do chọn phương án này thay vì `$queryRaw` với `Prisma.join`:

| Tiêu chí                            | Prisma có kiểu                                    | `$queryRaw` + `Prisma.join`                                                                                                                  |
| ----------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirement 5.5 tham số hóa         | Đạt tuyệt đối, không có SQL viết tay              | Đạt, nếu dùng đúng tagged template                                                                                                           |
| Requirement 5.6 tương thích dialect | Không còn dialect coupling                        | Vẫn phải viết backtick và `RAND()`                                                                                                           |
| Kiểu trả về                         | `Video[]` đúng kiểu Prisma                        | `isHidden` trả `0`/`1` thay vì `boolean`, `status` trả `string`. Cần map tay, và đây là lỗi âm thầm dễ lọt vì code hiện tại khai báo `any[]` |
| Requirement 5.4 thứ tự ngẫu nhiên   | `shuffle` trong ứng dụng, dùng `crypto.randomInt` | `ORDER BY RAND()`                                                                                                                            |
| Hiệu năng                           | Hai round trip, tải toàn bộ ID đủ điều kiện       | Một round trip, nhưng `ORDER BY RAND()` buộc MySQL sinh giá trị ngẫu nhiên cho mọi dòng và sort toàn bộ, không dùng được index               |

Điểm cần nói thẳng: **cả hai phương án đều không mở rộng tốt.** Phương án được chọn tải danh sách ID vào bộ nhớ ứng dụng; `ORDER BY RAND()` sort toàn bộ trong database. Với số video hiện tại của một sàn đang phát triển, cả hai đều chấp nhận được, và phương án Prisma có kiểu thắng ở mặt an toàn và không phụ thuộc dialect. Khi bảng `Video` vượt khoảng 100 000 dòng đủ điều kiện, cần đổi sang lấy mẫu theo dải khóa; hạng mục này được ghi nhận là công việc tối ưu riêng, **không** thuộc phạm vi migration.

`shuffle` dùng Fisher–Yates với `crypto.randomInt`, đặt tại `libs/utils`. Không dùng `Math.random()` cho việc chọn nội dung hiển thị.

`$queryRawUnsafe` sau thay đổi này **không còn xuất hiện ở đâu trong repository**. Thêm một quy tắc ESLint `no-restricted-syntax` chặn `$queryRawUnsafe` và `$executeRawUnsafe` để ngăn tái xuất hiện.

---

## Quản lý schema có version

### Trạng thái hiện tại

Chín `project.json` chỉ có:

```json
"push-prisma":     { "command": "prisma db push" }
"push-prisma-acl": { "command": "prisma db push --accept-data-loss" }
```

Không có thư mục `prisma/migrations` nào trong repository. `prisma db push` không sinh lịch sử, không thứ tự, không kiểm tra được, và `--accept-data-loss` cho phép mất dữ liệu không cảnh báo. `.github/workflows/push.yml` không chạy bước schema nào; deploy chỉ `kubectl rollout restart`.

### Quyết định

Thay bằng bốn target, phân biệt rõ theo mức độ chấp nhận mất dữ liệu (requirement 4.4):

| Target           | Lệnh                           | Môi trường                 | Mất dữ liệu               |
| ---------------- | ------------------------------ | -------------------------- | ------------------------- |
| `migrate-dev`    | `prisma migrate dev`           | chỉ local                  | Có, có xác nhận tương tác |
| `migrate-deploy` | `prisma migrate deploy`        | CI/CD, staging, production | Không                     |
| `migrate-status` | `prisma migrate status`        | mọi nơi                    | Không                     |
| `reset-local`    | `prisma migrate reset --force` | chỉ local, có guard        | Có, phá hủy toàn bộ       |

`reset-local` bọc một script guard, thoát với lỗi nếu `NODE_ENV` khác `development` hoặc nếu host trong database URL không thuộc allowlist local. Tên target không còn chứa từ "push" để không ai gõ nhầm.

Hai target `push-prisma` và `push-prisma-acl` bị xóa khỏi cả chín `project.json`.

### Migration khởi tạo

Target_Database là database mới và rỗng, nên không cần baseline từ schema có sẵn. Với từng service:

```
prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/<timestamp>_init_mysql/migration.sql
```

SQL sinh ra được **sửa tay** để bổ sung phần Prisma không diễn đạt được trong schema:

- `CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs` ở cấp table
- `COLLATE utf8mb4_0900_as_ci` trên bảy cột tìm kiếm
- `ROW_FORMAT=DYNAMIC` tường minh

Vì phần sửa tay này không suy ra được từ `schema.prisma`, `prisma migrate dev` sau này sẽ báo drift. Giải pháp: đưa các câu `ALTER TABLE ... MODIFY ... COLLATE ...` vào một migration riêng đặt ngay sau migration init, và ghi chú trong `prisma/README.md` của từng service rằng collation được quản lý bởi migration, không bởi schema. Đây là hạn chế của Prisma, không phải lựa chọn thiết kế.

### Guard chống mất dữ liệu (requirement 4.3)

`prisma migrate deploy` không tự dừng trước thay đổi phá hủy; nó áp dụng đúng những gì trong file migration. Vì vậy guard đặt ở tầng CI, không tầng runtime:

Script `tools/migration-guard/check-destructive.ts` quét mọi file `migration.sql` mới so với nhánh base, tìm:

```
DROP TABLE | DROP COLUMN | DROP INDEX | TRUNCATE
MODIFY .* NOT NULL | RENAME COLUMN | CHANGE COLUMN
```

Nếu tìm thấy và file không chứa dòng đánh dấu `-- kiro:allow-destructive: <lý do>`, job thất bại. Dòng đánh dấu buộc phải được thêm bởi con người trong pull request, tạo điểm review tường minh.

### Kiểm tra trong CI (requirement 4.5)

Thêm job `check-schema` vào `.github/workflows/push.yml`, chạy trước job `docker`:

1. Khởi động service container `mysql:8.0` với `sql_mode=STRICT_ALL_TABLES` và `transaction_isolation=READ-COMMITTED`.
2. Với từng service bị ảnh hưởng: `prisma migrate deploy` lên database rỗng, rồi `prisma migrate diff --from-schema-datasource --to-schema-datamodel --exit-code`. Exit code khác 0 nghĩa là `schema.prisma` đã đổi mà không có migration tương ứng → job thất bại.
3. Chạy `check-destructive.ts`.
4. Chạy `prisma validate` cho từng schema (requirement 2.1).

### Áp dụng migration khi deploy (requirement 4.2)

Pipeline hiện tại không có bước schema. Thiết kế yêu cầu, với mỗi service, một Kubernetes Job chạy `prisma migrate deploy` **hoàn tất thành công trước** khi `kubectl rollout restart` được gọi. Manifest cho Job này nằm ngoài repository (xem "Giới hạn kiểm chứng"), nên đây là hạng mục công việc hạ tầng, và thiết kế chỉ chốt hợp đồng: job phải chạy trước rollout, phải thất bại lớn tiếng, và phải dùng cùng secret với deployment.

---

## Components and Interfaces

Bảng tổng hợp các thành phần mới hoặc bị sửa, kèm hợp đồng của từng thành phần. Chi tiết thiết kế nằm ở các mục ngay sau.

| Thành phần                           | Vị trí                                                 | Hợp đồng                                                                                                                                              | Trạng thái  |
| ------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `PrismaService`                      | `apps/services/*/src/app/prisma/prisma.service.ts`     | `extends PrismaClient implements OnModuleInit`; constructor không tham số; `onModuleInit()` ném lỗi nếu không kết nối được                            | Sửa, 9 file |
| `buildMysqlAdapterConfig`            | `libs/configurations/src/lib/mysql-adapter.config.ts`  | `(url: string) => MariaDbAdapterConfig`; đặt `ssl`, `connectionLimit`, `idleTimeout`, `acquireTimeout` tường minh                                     | Mới         |
| `DatabaseConfiguration`              | `libs/configurations/src/lib/database.config.ts`       | Chín biến, mỗi biến validate giao thức `mysql:` và tên database; lỗi không chứa giá trị input                                                         | Sửa         |
| `ScalarListCodec`                    | `libs/utils/src/lib/scalar-list.util.ts`               | `readStringList(Prisma.JsonValue \| null) => string[]`, `writeStringList(readonly string[] \| null) => Prisma.InputJsonValue`; round-trip là identity | Mới         |
| `shuffle`                            | `libs/utils/src/lib/shuffle.util.ts`                   | `<T>(items: readonly T[]) => T[]`; Fisher–Yates với `crypto.randomInt`; không mutate input                                                            | Mới         |
| `maskDatabaseError`                  | `libs/utils/src/lib/mask-database-error.util.ts`       | `(error: unknown) => string`; output không chứa username, password, host, query parameter, certificate                                                | Mới         |
| `MaintenanceInterceptor`             | `libs/interceptors/src/lib/maintenance.interceptor.ts` | Đọc `MAINTENANCE_MODE`; ở `read-only` trả gRPC `FAILED_PRECONDITION` / HTTP `503` với mã `MAINTENANCE`; không chặn probe                              | Mới         |
| `UserGroup` model + `toUserResponse` | `iam-service` schema và `user.repository.ts`           | Repository trả `group: string[]` như trước; mọi hàm đọc User đi qua `toUserResponse`                                                                  | Mới         |
| `VideoRepository.feed`               | `utility-service` video repository                     | `({ limit, excludeIds? }) => Promise<Video[]>`; không raw SQL; `limit` bị chặn trên bởi `MAX_FEED_LIMIT`                                              | Sửa         |
| `db-migration` CLI                   | `libs/db-migration`                                    | Sáu lệnh `precheck`, `inventory`, `copy`, `fix-sequence`, `validate`, `reverse-copy`; exit code khác 0 khi có kiểm tra thất bại                       | Mới         |
| `check-destructive`                  | `tools/migration-guard/check-destructive.ts`           | Nhận diff migration; exit khác 0 nếu có câu phá hủy thiếu đánh dấu `-- kiro:allow-destructive:`                                                       | Mới         |
| Nx target schema                     | `apps/services/*/project.json`                         | `migrate-dev`, `migrate-deploy`, `migrate-status`, `reset-local`; bỏ `push-prisma`, `push-prisma-acl`                                                 | Sửa, 9 file |

---

## Chuyển đổi Prisma runtime và dependency

### Adapter

Đã kiểm chứng bằng registry: `@prisma/adapter-mariadb@7.6.0` tồn tại, phụ thuộc `@prisma/driver-adapter-utils@7.6.0` và `mariadb@3.4.5`. Phiên bản khớp chính xác `prisma@7.6.0` và `@prisma/client@7.6.0` hiện có, thỏa requirement 3.2. Adapter này là adapter MySQL/MariaDB chính thức của Prisma và export `PrismaMariaDb`.

`package.json`:

```diff
-    "@prisma/adapter-pg": "^7.6.0",
+    "@prisma/adapter-mariadb": "7.6.0",
```

Ghim phiên bản chính xác thay vì dùng `^`. Lý do: driver adapter là thành phần mới trong dòng Prisma 7 và có báo cáo lỗi liên quan tới quản lý connection pool giữa các bản minor. Ghim chính xác khiến hành vi tái lập được và việc nâng cấp là quyết định tường minh.

`pnpm-lock.yaml` được tạo lại. `@prisma/adapter-pg` bị xóa hoàn toàn khỏi dependency runtime (requirement 3.3). Bước xác nhận: `pnpm why @prisma/adapter-pg` phải trả về không có kết quả.

### `prisma.service.ts` (9 file, cùng một mẫu)

```ts
import { DatabaseConfiguration } from '@common/configurations/database.config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma-client/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaMariaDb(buildMysqlAdapterConfig(DatabaseConfiguration.CATALOG_SERVICE_DATABASE_URL));
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      PrismaService.logger.error(maskDatabaseError(error));
      throw new Error('Không kết nối được database của catalog-service');
    }
  }
}
```

Ba thay đổi so với hiện tại, mỗi thay đổi gắn với một acceptance criterion:

- `buildMysqlAdapterConfig` (mới, tại `libs/configurations`) phân giải URL thành config object của driver `mariadb`, đặt `ssl` tường minh và cấu hình pool. Đáp requirement 10.8: TLS không được để phụ thuộc query parameter trong URL, vì `@prisma/adapter-mariadb` nhận TLS qua option của driver và hành vi khi chỉ truyền URL không được đảm bảo. Config này set `ssl: { rejectUnauthorized: true }` và nạp CA bundle khi biến môi trường CA được cấp.
- `onModuleInit` thực hiện health-check query (requirement 3.6). Hiện tại không service nào kiểm tra kết nối lúc khởi động; lỗi cấu hình chỉ lộ ra ở request đầu tiên.
- `maskDatabaseError` (mới, tại `libs/utils`) che username, password, host, query parameter và certificate material trước khi log (requirement 10.7). Driver `mariadb` có xu hướng đưa host và user vào message lỗi.

Cấu hình pool đặt tường minh (`connectionLimit`, `idleTimeout`, `acquireTimeout`) thay vì dựa mặc định. Lý do: có báo cáo công khai về việc `idleTimeout` không được tôn trọng trong một số bản Prisma 7 với adapter này, dẫn tới connection đọng ở trạng thái `Sleep`. Đặt tường minh cho phép kiểm chứng bằng `SHOW PROCESSLIST` trong Acceptance_Environment và là điểm điều chỉnh khi gặp vấn đề. Đây là rủi ro từ nguồn bên ngoài, chưa được tái hiện trên dự án này.

### `prisma.config.ts` (9 file)

Không đổi cấu trúc. Vẫn `url: process.env.<SVC>_SERVICE_DATABASE_URL`. Chỉ giá trị biến môi trường đổi từ `postgresql://` sang `mysql://` (requirement 10.1).

### `datasource` trong 9 schema

```diff
 datasource db {
-    provider = "postgresql"
+    provider = "mysql"
 }
```

`generator client` không đổi. `binaryTargets = ["native", "debian-openssl-1.1.x"]` giữ nguyên. `prisma-json-types-generator` giữ nguyên ở 5 service đang dùng.

---

## Cấu hình môi trường và credential

### Kiểm tra biến môi trường (requirement 10.2)

`libs/configurations/src/lib/database.config.ts` hiện chỉ kiểm `z.string()`. Nâng thành:

```ts
const mysqlUrl = (expectedDatabase: string) =>
  z.string().superRefine((raw, ctx) => {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      return ctx.addIssue({ code: 'custom', message: 'Database URL không hợp lệ' });
    }
    if (url.protocol !== 'mysql:') {
      ctx.addIssue({ code: 'custom', message: 'Database URL phải dùng giao thức mysql://' });
    }
    if (url.pathname.replace(/^\//, '') !== expectedDatabase) {
      ctx.addIssue({
        code: 'custom',
        message: `Database URL phải trỏ tới database "${expectedDatabase}"`,
      });
    }
  });

export const DatabaseConfigurationSchema = z.object({
  CATALOG_SERVICE_DATABASE_URL: mysqlUrl('catalog_service'),
  ORDER_SERVICE_DATABASE_URL: mysqlUrl('order_service'),
  PROMOTION_SERVICE_DATABASE_URL: mysqlUrl('promotion_service'),
  PAYMENT_SERVICE_DATABASE_URL: mysqlUrl('payment_service'),
  UTILITY_SERVICE_DATABASE_URL: mysqlUrl('utility_service'),
  IAM_SERVICE_DATABASE_URL: mysqlUrl('iam_service'),
  SHOP_SERVICE_DATABASE_URL: mysqlUrl('shop_service'),
  WALLET_SERVICE_DATABASE_URL: mysqlUrl('wallet_service'),
  AI_SERVICE_DATABASE_URL: mysqlUrl('ai_service'),
});
```

Đồng thời sửa khối xử lý lỗi hiện tại. Code hiện `console.error(configServer.error)` — zod error chứa nguyên văn giá trị input, nghĩa là **database URL kèm password bị in ra log khi cấu hình sai**. Đây là lỗ hổng có thật trong code hiện tại. Thay bằng in danh sách tên biến sai kèm message, không in giá trị (requirement 10.7).

Tên chín database logic dùng snake_case theo service (`catalog_service`, ...). Việc ràng buộc tên trong URL ngăn sự cố một service trỏ vào database của service khác, vốn không thể phát hiện được nếu chỉ kiểm giao thức.

Giữ nguyên tên chín biến môi trường (requirement 10.1) nên `.env.example` chỉ cần đổi giá trị mẫu sang dạng `mysql://user:pass@host:3306/catalog_service`.

### Credential

Manifest triển khai không nằm trong repository này (đã kiểm chứng: không có `values.yaml`, không có Helm chart, không có k8s manifest; pipeline chỉ gọi `kubectl rollout restart`). Do đó thiết kế chốt hợp đồng thay vì file cụ thể:

- Kubernetes Secret cấp chín URL cho pod qua `envFrom.secretRef`. Không dùng `env.value` dạng rõ.
- Nguồn của Secret là AWS Secrets Manager, đồng bộ bằng External Secrets Operator hoặc Secrets Store CSI Driver. Repository chỉ chứa **tên** secret, không chứa giá trị (requirement 10.4).
- Credential MySQL mới được sinh mới hoàn toàn, không tái sử dụng bất kỳ chuỗi nào từ cấu hình PostgreSQL (requirement 10.6).
- Sau khi Cutover được chấp nhận, credential PostgreSQL bị thu hồi ở cả Neon và secret store, và biến môi trường PostgreSQL bị xóa khỏi workload (requirement 10.5). Thu hồi diễn ra **sau** khi hết thời hạn rollback, không phải ngay sau cutover.

`requirements.md` nêu "Helm manifest đang chứa chín PostgreSQL URL và credential dạng rõ". Không kiểm chứng được điều này trong repository. Cần một lần quét lịch sử git (`git log -p -S 'postgresql://'`) để xác định credential có từng được commit hay không; nếu có, rotate là bắt buộc chứ không tùy chọn. Hạng mục này được ghi nhận là việc phải làm, kết quả chưa biết.

---

## Kiến trúc công cụ migration dữ liệu

Một Nx library mới `libs/db-migration`, chạy như CLI trong container có kết nối tới cả PostgreSQL và MySQL. Không phải phần của service runtime.

```
libs/db-migration/
├── src/
│   ├── cli.ts                     # entrypoint, phân giải lệnh
│   ├── commands/
│   │   ├── precheck.ts            # req 7.9, 2.5, 10.x — chạy trước mọi thứ
│   │   ├── inventory.ts           # req 6.1, 6.2 — sinh Baseline_Manifest
│   │   ├── copy.ts                # req 6.3 — chuyển dữ liệu
│   │   ├── validate.ts            # req 6.4–6.11 — sinh Validation_Report
│   │   ├── fix-sequence.ts        # req 6.8 — đặt lại AUTO_INCREMENT
│   │   └── reverse-copy.ts        # req 8.8 — đường rollback sau khi có ghi trên MySQL
│   ├── core/
│   │   ├── canonical.ts           # Canonical_Record
│   │   ├── checksum.ts            # băm và tổng hợp
│   │   ├── plan.ts                # thứ tự bảng theo phụ thuộc FK
│   │   ├── transform.ts           # ánh xạ giá trị theo kiểu
│   │   └── report.ts              # xuất báo cáo
│   └── plans/                     # 9 file kế hoạch, một cho mỗi service
└── project.json
```

### Canonical_Record

Biểu diễn ổn định để so sánh hai database khác engine. Quy tắc chuẩn hóa, thiết kế trực tiếp từ requirement 6.5 và 6.9–6.11:

| Kiểu               | Quy tắc                                           | Lý do                                                                                 |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `null`             | ký tự canh `\u0000NULL`                           | Phân biệt `null` với chuỗi `"null"`                                                   |
| `String`           | nguyên văn, không trim, không normalize Unicode   | Normalize sẽ làm mất khác biệt NFC/NFD thật của dữ liệu                               |
| `Int`              | biểu diễn thập phân                               |                                                                                       |
| `Float`            | `toFixed(9)`                                      | Khớp ngưỡng 1e-9 của requirement 6.10 mà không phụ thuộc định dạng in của từng driver |
| `Boolean`          | `1` / `0`                                         | MySQL trả `TINYINT`, PostgreSQL trả `boolean`                                         |
| `DateTime`         | ISO-8601 UTC, đúng 3 chữ số mili giây             | Cả hai đều lưu ms. Ép định dạng loại bỏ khác biệt in                                  |
| `enum`             | tên giá trị                                       |                                                                                       |
| `Json`             | JSON với khóa sắp xếp đệ quy, không khoảng trắng  | Cả `jsonb` và `JSON` đều chuẩn hóa nhưng không theo cùng quy tắc                      |
| Scalar list nhóm A | JSON array **giữ nguyên thứ tự và phần tử trùng** | Requirement 6.11 và 2.5. Đây là điểm không được sắp xếp                               |
| `User.group`       | mảng enum **có sắp xếp**                          | Ngoại lệ đã tuyên bố: thứ tự không được bảo toàn theo thiết kế bảng con               |

Băm mỗi bản ghi bằng SHA-256 trên chuỗi canonical, với tên cột nối vào để đổi tên cột không lọt qua. Checksum cấp bảng là `XOR` của toàn bộ row hash cộng với số bản ghi. Chọn XOR vì độc lập thứ tự đọc, cho phép đọc song song và phân trang mà không cần `ORDER BY` toàn cục.

### Thứ tự copy

Copy theo thứ tự topo của khóa ngoại, giữ nguyên kiểm tra FK trong suốt quá trình. Không dùng `SET FOREIGN_KEY_CHECKS = 0`: bật FK là cách rẻ nhất để phát hiện orphan ngay tại thời điểm ghi, và requirement 6.6 yêu cầu số khóa ngoại không có bản ghi cha bằng 0.

| Service             | Thứ tự                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `iam-service`       | `User` → `UserGroup` → `Permission`                                                                                       |
| `catalog-service`   | `Brand` → `Category` (theo tầng, gốc trước con, vì self-FK `parentCategoryId`) → `Product` → `SKU` → `_ProductCategories` |
| `shop-service`      | `Merchant` → `Shop`                                                                                                       |
| `order-service`     | `Cart` → `CartItem`; `Order` → `OrderItem`                                                                                |
| `payment-service`   | `Payment`, `Transaction`, `Refund` (không FK giữa ba bảng)                                                                |
| `promotion-service` | `Promotion` → `Redemption`                                                                                                |
| `utility-service`   | `Notification`, `Report`, `RatingAggregate`, `Video`, `Review` → `ReviewReply`                                            |
| `wallet-service`    | `Wallet` → `WalletTransaction`; `Credit` → `CreditTransaction`, `Credit` → `PayoutRequest`                                |
| `ai-service`        | `ReviewSummary`                                                                                                           |

Hai điểm dễ bỏ sót, nêu tường minh:

- `_ProductCategories` là bảng nối do quan hệ m-n ngầm `ProductCategories` sinh ra. Nó không phải model nên không xuất hiện trong danh sách 30 model, nhưng chứa dữ liệu nghiệp vụ và phải được copy cùng validate như một bảng bình thường.
- `Category` có self-FK. Copy theo thứ tự chèn ngẫu nhiên sẽ vi phạm FK. Kế hoạch copy `Category` theo tầng: `parentCategoryId IS NULL` trước, rồi lặp theo độ sâu.

### Copy

- Phân trang keyset trên khóa chính, không `OFFSET`. Lô 1000 dòng.
- Đọc bằng raw SQL trên PostgreSQL, không qua Prisma Client, để đọc được đúng dữ liệu thô kể cả bản ghi soft-deleted và giá trị mảng chưa chuyển đổi (requirement 6.3).
- Ghi bằng multi-row `INSERT` trong transaction mỗi lô. Idempotent qua `INSERT ... ON DUPLICATE KEY UPDATE` để lô thất bại có thể chạy lại.
- `transform.ts` áp dụng đúng ba phép biến đổi: `String[]` → JSON array (nhóm A), `User.group` → nhiều dòng `UserGroup` (nhóm B), `jsonb` → JSON. Mọi kiểu khác đi thẳng.
- Retry với backoff cho lỗi tạm thời; dừng ngay với lỗi ràng buộc, vì đó là sai lệch dữ liệu cần điều tra.

### Precheck

Chạy trước mọi lần copy, trên PostgreSQL. Chặn Cutover nếu bất kỳ kiểm tra nào thất bại (requirement 7.9, 6.12):

| Kiểm tra                                                             | Chặn khi                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| `MAX(CHAR_LENGTH(col))` cho từng cột chuỗi                           | Vượt độ dài `VarChar` đích đã chọn                     |
| `OCTET_LENGTH` cho cột `Text` / `MediumText`                         | Vượt 65 535 hoặc 16 777 215 byte tương ứng             |
| Trùng lặp không phân biệt hoa thường trên cột unique dự kiến `as_ci` | Có bất kỳ nhóm trùng                                   |
| Byte length của mọi index sau chuẩn hóa                              | Vượt 3072                                              |
| Phần tử trùng trong `User.group`                                     | Có, và ghi vào báo cáo                                 |
| Số trong JSON vượt `2^53` hoặc quá 17 chữ số nghĩa                   | Có                                                     |
| `DateTime` ngoài dải `DATETIME` của MySQL (1000-01-01 .. 9999-12-31) | Có                                                     |
| Ký tự `\u0000` trong cột chuỗi                                       | Có. PostgreSQL `text` chấp nhận, MySQL xử lý khác      |
| Orphan FK đã tồn tại trên PostgreSQL                                 | Có. Phải sửa nguồn trước, không copy rồi mới phát hiện |

Bước cuối là quan trọng: nếu PostgreSQL đang có orphan (khả năng cao với `onUpdate: NoAction` và các FK `NoAction` trên `Product.brandId`), copy sẽ thất bại giữa đường. Phát hiện trước cho phép sửa dữ liệu nguồn trong điều kiện bình thường thay vì trong cửa sổ Write_Freeze.

### Validation_Report

Cấu trúc mỗi service:

```jsonc
{
  "service": "catalog-service",
  "generatedAt": "…",
  "baselineManifestRef": "…",
  "tables": [
    {
      "table": "Product",
      "checks": {
        "rowCount": { "source": 0, "target": 0, "pass": true },
        "checksum": { "source": "…", "target": "…", "pass": true },
        "minKey": { "source": "…", "target": "…", "pass": true },
        "maxKey": { "source": "…", "target": "…", "pass": true },
        "financialSums": { "…": { "source": 0, "target": 0, "pass": true } },
        "dateTimeDrift": { "maxDeltaMs": 0, "pass": true },
        "floatDrift": { "maxAbsDelta": 0, "pass": true },
        "scalarLists": { "mismatched": 0, "pass": true },
        "orphanForeignKeys": { "count": 0, "pass": true },
      },
      "failures": [{ "recordKey": "…", "check": "…", "detail": "…" }],
    },
  ],
  "overall": "pass",
}
```

Aggregate tài chính theo requirement 6.7: `amount` (`Payment`, `Refund`, `WalletTransaction`, `CreditTransaction`, `PayoutRequest`), `balance` (`Wallet`, `Credit`), `balanceAfter` (`WalletTransaction`, `CreditTransaction`), `amountIn` / `amountOut` / `accumulated` (`Transaction`), `itemTotal` / `shippingFee` / `discount` / `grandTotal` (`Order`). Tất cả đều là `Int` nên tổng phải khớp **chính xác**, không có ngưỡng sai số.

`fix-sequence` chạy sau khi copy `Transaction`: `ALTER TABLE Transaction AUTO_INCREMENT = <max+1>`, rồi `validate` xác nhận giá trị tiếp theo lớn hơn `MAX(id)` đã chuyển (requirement 6.8).

Bất kỳ `pass: false` nào khiến `overall` thành `fail` và chặn Cutover, kèm danh sách service, bảng, khóa bản ghi, phép kiểm tra (requirement 6.12).

---

## Cutover, backup và rollback

### Write_Freeze

Requirement 8.4 yêu cầu Service từ chối thao tác ghi với trạng thái bảo trì xác định trước. Cơ chế này **chưa tồn tại** và là code mới.

Thiết kế: một `MaintenanceInterceptor` trong `libs/` được đăng ký ở cả chín service.

- Đọc biến môi trường `MAINTENANCE_MODE` (`off` | `read-only`).
- Ở `read-only`, chặn mọi gRPC method có tên khớp tiền tố ghi (`Create`, `Update`, `Delete`, `Adjust`, `Upsert`, `Cancel`, `Approve`, `Settle`, `Increase`, `Decrease`) và mọi HTTP method khác `GET` / `HEAD`.
- Trả gRPC `FAILED_PRECONDITION` với `details` chứa mã `MAINTENANCE`, và HTTP `503` với body `{ code: 'MAINTENANCE' }`. Mã cố định để BFF và frontend nhận diện được.
- Không chặn health-check và readiness probe, nếu không pod sẽ bị restart trong lúc freeze.

Cách dùng danh sách tiền tố thay vì annotate từng handler là đánh đổi có ý thức: rẻ hơn nhiều và đủ chính xác cho một cửa sổ bảo trì có kiểm soát. Cần một test liệt kê toàn bộ gRPC method của chín service và khẳng định mỗi method ghi đều bị chặn, để tiền tố mới không lọt.

### Trình tự Cutover

| Bước | Hành động                                                                                 | Cổng chặn                                             |
| ---- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 0    | `precheck` trên toàn bộ chín Source_Database                                              | Mọi kiểm tra pass (req 7.9)                           |
| 1    | Xác nhận backup khôi phục được cho chín Source_Database                                   | Backup tồn tại và mới (req 8.1)                       |
| 2    | Diễn tập khôi phục backup vào Acceptance_Environment, so số bản ghi với Baseline_Manifest | Khớp (req 8.2)                                        |
| 3    | Diễn tập toàn bộ copy + validate trong Acceptance_Environment, đo thời lượng              | `overall: pass`, thời lượng trong ngưỡng đã phê duyệt |
| 4    | Áp dụng `migrate deploy` lên chín Target_Database production                              | Không lỗi                                             |
| 5    | Copy khối lớn khi hệ thống vẫn đang chạy (dữ liệu lịch sử, bất biến)                      | Không lỗi                                             |
| 6    | Bật `MAINTENANCE_MODE=read-only` cho chín service                                         | Bắt đầu Write_Freeze (req 8.3)                        |
| 7    | `inventory` lần cuối trên Source_Database                                                 | Baseline_Manifest chốt                                |
| 8    | Copy phần chênh lệch                                                                      | Không lỗi                                             |
| 9    | `fix-sequence`                                                                            | Không lỗi                                             |
| 10   | `validate` toàn bộ chín service                                                           | `overall: pass` (req 8.5)                             |
| 11   | Đổi chín biến môi trường sang MySQL, rollout chín service                                 | Pod ready                                             |
| 12   | Health-check kết nối + chạy Critical_Flow (req 9.1–9.10) trên production                  | Toàn bộ pass (req 8.6)                                |
| 13   | `MAINTENANCE_MODE=off`                                                                    | Kết thúc Write_Freeze. **Điểm không quay lại rẻ**     |
| 14   | Theo dõi 24 giờ                                                                           | Không lỗi tầng dữ liệu                                |
| 15   | Thu hồi credential PostgreSQL                                                             | (req 10.5)                                            |

Bước 5 tách khỏi bước 8 để giảm thời lượng Write_Freeze: phần lớn dữ liệu (`Transaction`, `WalletTransaction`, `CreditTransaction`, `Notification`, `OrderItem` của đơn đã hoàn tất) là bất biến và copy được trước khi freeze.

### Rollback

Requirement 8.7 và 8.8 cần được nói chính xác vì có hai chế độ khác nhau, và tài liệu phải phân biệt rõ:

**Rollback trước bước 13 (rẻ).** Chưa có ghi nào vào MySQL từ traffic thật. Rollback = đổi chín biến môi trường về PostgreSQL, rollout, tắt `MAINTENANCE_MODE`. Không cần chuyển đổi dữ liệu ngược, đúng như requirement 8.8. Source_Database vẫn nguyên vì Write_Freeze đã chặn ghi.

**Rollback sau bước 13 (đắt).** Traffic đã ghi vào MySQL. Trở về PostgreSQL nghĩa là mất các ghi đó, trừ khi chạy `reverse-copy`. Vì vậy thiết kế đặt một cửa sổ chuyển tiếp tường minh:

- Trong 24 giờ sau bước 13, `reverse-copy` khả dụng. Nó chuyển ngược delta từ MySQL về PostgreSQL, áp dụng biến đổi nghịch (JSON array → `String[]`, `UserGroup` → `User.group`). Rollback trong cửa sổ này = freeze lại, `reverse-copy`, validate ngược, đổi URL về PostgreSQL.
- Sau 24 giờ, rollback không còn là thao tác kỹ thuật mà là quyết định nghiệp vụ về mất dữ liệu, và phải được xử lý như một sự cố.

`reverse-copy` chỉ hỗ trợ chín Source_Schema PostgreSQL ở dạng chưa đổi. Do đó nhánh git chứa Source_Schema và `@prisma/adapter-pg` phải được giữ dưới dạng tag phát hành, và image container của phiên bản trước cutover không bị prune trong cửa sổ này. Pipeline hiện tại **prune ECR còn 1 image** (`KEEP: 1`), nghĩa là image rollback sẽ bị xóa bởi lần deploy kế tiếp. Đây là xung đột thật với kế hoạch rollback: `KEEP` phải được nâng, hoặc image trước cutover phải được tag bảo vệ, trước khi bắt đầu Cutover.

### Audit log

`cutover-log.json` do công cụ ghi, chứa từng bước với thời điểm bắt đầu, thời điểm kết thúc, trạng thái, người phê duyệt, và thời lượng Write_Freeze tính từ bước 6 đến bước 13 (requirement 8.9).

---

## Correctness Properties

Các bất biến phải đúng với mọi input, không chỉ với ví dụ đã chọn. Đây là những phát biểu mà kiểm thử tính chất và Validation_Report phải chứng minh.

### Property 1: Round-trip scalar list là identity

`readStringList(writeStringList(x))` sâu bằng `x`.

Miền: mọi `x: string[]`, bắt buộc gồm mảng rỗng, phần tử trùng lặp, chuỗi rỗng, tiếng Việt có dấu, ký tự bốn byte, phần tử dài 1000 ký tự, mảng 100 phần tử.

**Validates: Requirements 2.5, 6.11**

### Property 2: Ghi scalar list không biến đổi dữ liệu

`writeStringList` không đổi thứ tự, không bỏ phần tử trùng, không trim, không normalize Unicode. Miền như Property 1.

**Validates: Requirements 2.5**

### Property 3: Canonical_Record độc lập thứ tự khóa

`canonical(record)` cho cùng chuỗi bất kể thứ tự khóa của object đầu vào. Miền: mọi giá trị JSON hợp lệ.

**Validates: Requirements 6.5**

### Property 4: Canonical_Record đồng nhất giữa hai engine

`canonical` của cùng dữ liệu logic đọc từ PostgreSQL và từ MySQL cho cùng chuỗi. Miền: 30 model.

Đây là bất biến nền tảng của toàn bộ phép đối soát; nếu nó sai, mọi checksum đều vô nghĩa.

**Validates: Requirements 6.5**

### Property 5: Checksum độc lập thứ tự đọc

Checksum cấp bảng không đổi khi thay đổi thứ tự phân trang hoặc số worker đọc song song.

**Validates: Requirements 6.2, 6.4**

### Property 6: `copy` idempotent

Chạy `copy` n lần cho cùng trạng thái đích như chạy một lần, với mọi `n ≥ 1`.

**Validates: Requirements 6.3**

### Property 7: `reverse-copy` nghịch đảo `copy`

`reverse-copy(copy(x))` sâu bằng `x` ở tầng dữ liệu logic. Miền: mọi bảng chứa scalar list và bảng `UserGroup`.

Ngoại lệ đã tuyên bố: thứ tự phần tử của `User.group` không thuộc phạm vi bất biến này.

**Validates: Requirements 8.8**

### Property 8: `shuffle` là phép hoán vị

Output của `shuffle` là đa tập bằng input, và input không bị mutate. Miền: mọi mảng.

**Validates: Requirements 5.4**

### Property 9: `feed` luôn tôn trọng `excludeIds`

`feed` không bao giờ trả bản ghi có `id` thuộc `excludeIds`, và cấu trúc câu truy vấn không đổi bất kể nội dung `excludeIds`.

Miền: mọi `excludeIds`, bắt buộc gồm phần tử chứa `'`, `"`, `;`, `--`, `\`, `%`, `_`, và chuỗi rỗng.

**Validates: Requirements 5.2, 5.5**

### Property 10: `feed` tôn trọng giới hạn

`feed` trả không quá `min(limit, MAX_FEED_LIMIT)` bản ghi. Miền: mọi `limit`, gồm 0, số âm, và giá trị rất lớn.

**Validates: Requirements 5.3**

### Property 11: Collation `as_ci` khớp hoa thường nhưng không khớp dấu

Trên bảy cột tìm kiếm, `contains` khớp khi chỉ khác hoa thường và **không** khớp khi khác dấu. Miền: chuỗi tiếng Việt có dấu.

**Validates: Requirements 7.4**

### Property 12: Lọc group cho cùng kết quả

Lọc `User` qua `UserGroup` trả cùng tập khóa người dùng như `hasSome` trên PostgreSQL với cùng dữ liệu. Miền: mọi tập con của `GROUP`, gồm tập rỗng.

Cùng với Property 4, đây là bất biến khó kiểm thử nhất vì cần cả hai engine chạy đồng thời; được kiểm chứng bởi tầng parity trong Testing Strategy.

**Validates: Requirements 7.5**

### Property 13: Log không lộ credential

`maskDatabaseError(e)` không chứa chuỗi con nào là password hay username của URL xuất hiện trong `e`. Miền: mọi database URL có credential, gồm ký tự đã percent-encode.

**Validates: Requirements 10.7**

### Property 14: Write_Freeze chặn đủ và không chặn quá

Ở `MAINTENANCE_MODE=read-only`, mọi gRPC method ghi của chín service bị chặn, và không method health-check hay readiness probe nào bị chặn. Miền: toàn bộ danh sách method của chín service.

**Validates: Requirements 8.4**

### Property 15: Tổng tài chính khớp chính xác

Tổng của 11 trường tài chính kiểu `Int` khớp **chính xác** giữa Source_Database và Target_Database, không có ngưỡng sai số.

**Validates: Requirements 6.7**

---

## Error Handling

Nguyên tắc: lỗi tầng dữ liệu phải dừng lớn tiếng và không lộ credential. Không có đường nào âm thầm trả giá trị mặc định.

| Tình huống                                                       | Hành vi                                                                                                                             | Requirement     |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Database URL không dùng giao thức `mysql:` hoặc sai tên database | Process thoát khi khởi động với danh sách tên biến sai; **không in giá trị biến**                                                   | 3.7, 10.2, 10.7 |
| Không kết nối được database lúc khởi động                        | `onModuleInit` ném lỗi có thông điệp nêu tên service; message gốc đi qua `maskDatabaseError` trước khi log; pod không đạt readiness | 3.6, 10.7       |
| Lỗi kết nối hoặc lỗi driver khi đang chạy                        | Log qua `maskDatabaseError`; không trả chi tiết database cho client, chỉ mã lỗi chung                                               | 10.7            |
| TLS handshake thất bại                                           | Khởi động thất bại, không tự hạ cấp sang kết nối không mã hóa                                                                       | 10.8            |
| `readStringList` nhận giá trị không phải mảng chuỗi              | Ném lỗi kèm tên model, tên trường, khóa bản ghi. **Không trả `[]`**, vì dữ liệu sai kiểu là dấu hiệu hỏng dữ liệu                   | 2.4, 2.5        |
| `precheck` phát hiện vi phạm                                     | Exit khác 0, xuất danh sách service, model, trường, khóa bản ghi; không copy dòng nào                                               | 7.9             |
| `copy` gặp lỗi tạm thời (mất kết nối, timeout)                   | Retry lô hiện tại với backoff; lô là idempotent nên an toàn                                                                         | 6.3             |
| `copy` gặp lỗi ràng buộc (FK, unique, độ dài)                    | Dừng ngay, không retry, xuất lô và khóa bản ghi gây lỗi. Retry chỉ che mất sai lệch dữ liệu                                         | 6.12, 7.9       |
| `validate` có bất kỳ kiểm tra thất bại                           | `overall: fail`, exit khác 0, chặn Cutover, liệt kê service, model, khóa bản ghi, phép kiểm tra                                     | 6.12            |
| `migrate deploy` thất bại                                        | Kubernetes Job thất bại; rollout **không** được kích hoạt                                                                           | 4.2             |
| Migration chứa câu phá hủy không có đánh dấu                     | Job CI thất bại trước khi merge                                                                                                     | 4.3             |
| `reset-local` chạy ngoài môi trường local                        | Script guard thoát với lỗi trước khi gọi Prisma                                                                                     | 4.4             |
| Ghi vào Service trong Write_Freeze                               | gRPC `FAILED_PRECONDITION` hoặc HTTP `503` với mã `MAINTENANCE`; không ghi phần nào                                                 | 8.4             |
| Critical_Flow thất bại ở bước 12 của Cutover                     | Rollback theo chế độ rẻ; ghi vào `cutover-log.json`                                                                                 | 8.7             |
| `STRICT_ALL_TABLES` chặn một insert                              | Coi là lỗi ràng buộc, dừng ngay. Đây chính là lý do bật strict mode: biến việc cắt dữ liệu âm thầm thành lỗi thấy được              | 2.8, 7.9        |

---

## Testing Strategy

Repository **không có framework test nào**: không `jest.config`, không `vitest`, không target `test` trong `nx.json` hay bất kỳ `project.json`. Requirement 9.11 nói về "bộ kiểm thử hồi quy chạy trên Target_Database" nhưng bộ đó chưa tồn tại. Việc thiết lập là phần của công việc này, không phải giả định.

### Thiết lập

Vitest cho toàn workspace (khớp Nx 22 và swc sẵn có, khởi động nhanh hơn Jest cho monorepo). Thêm target `test` cho chín service và các lib liên quan.

### Bốn tầng

**1. Unit — thuần logic, không database.**

- `ScalarListCodec`: kiểm thử tính chất với dữ liệu sinh ngẫu nhiên. Bất biến: `read(write(x))` sâu bằng `x`. Miền sinh phải bao gồm mảng rỗng, phần tử trùng, chuỗi rỗng, tiếng Việt có dấu, emoji bốn byte, chuỗi 1000 ký tự, và mảng 100 phần tử. Đây là phòng tuyến chính cho requirement 2.5.
- `canonical.ts`: cùng input cho ra cùng chuỗi bất kể thứ tự khóa của object đầu vào; `Float` và `DateTime` cho ra định dạng cố định.
- `maskDatabaseError`: không có output nào chứa password hay username của các URL mẫu.
- `MaintenanceInterceptor`: mọi tên method ghi bị chặn, mọi method đọc và probe đi qua.

**2. Integration — MySQL 8.0 thật qua testcontainer.**

Container cấu hình đúng như production: `utf8mb4`, `STRICT_ALL_TABLES`, `READ-COMMITTED`, `ROW_FORMAT=DYNAMIC`. Schema tạo bằng `prisma migrate deploy` để test chính đường dẫn deploy.

- Tạo được toàn bộ 30 model và 27 enum, và `Permission` unique index tạo thành công (requirement 2.1, 2.2, và là test hồi quy cho vấn đề 3072 byte).
- Round-trip tám scalar list qua repository thật.
- Round-trip năm trường JSON, khẳng định string, number, boolean, null, array, object giữ đúng kiểu (requirement 7.7).
- Lưu và đọc chuỗi tiếng Việt, ký tự bốn byte, chuỗi rỗng (requirement 7.2).
- `contains` trên bảy cột `as_ci`: khớp khác hoa thường, **không** khớp khác dấu. Đây là test khẳng định lựa chọn `as_ci` thay vì `ai_ci` là đúng.
- Unique constraint trên `User.email` phân biệt hoa thường.
- Lọc `User.group` qua `UserGroup` cho cùng tập khóa như `hasSome` (requirement 7.5).
- `Referential_Action`: Cascade xóa con, SetNull đặt null, NoAction chặn (requirement 7.8).
- `Transaction` AUTO_INCREMENT tiếp tục đúng sau khi seed dữ liệu có `id` tường minh.
- `video.repository.feed`: lọc đúng ba điều kiện, loại `excludeIds`, tôn trọng limit, và **`excludeIds` chứa `'`, `;`, `--`, `\` không làm vỡ truy vấn** (requirement 5.1–5.5).

**3. Parity — so PostgreSQL với MySQL trên cùng fixture.**

Đây là tầng trả lời trực tiếp requirement 7.4 và 7.5, và là tầng dễ bị bỏ qua nhất. Harness chạy cùng một hàm repository trên hai container (PostgreSQL 16 và MySQL 8) đã seed cùng fixture, rồi so tập khóa bản ghi trả về.

Fixture phải cố tình chứa các trường hợp biên: tên sản phẩm khác nhau hoa thường, tên khác nhau dấu (`Cà phê` / `Ca phe` / `CÀ PHÊ`), mã đơn khác hoa thường, người dùng nhiều group và một group, bản ghi soft-deleted.

Phạm vi: bảy hàm `contains` và một hàm lọc `group`. Không cố phủ toàn bộ repository — chi phí không tương xứng.

**4. Migration tooling.**

- `canonical` cho ra checksum ổn định giữa các lần chạy và giữa hai engine trên cùng dữ liệu logic.
- `validate` phát hiện lỗi được tiêm vào: xóa một dòng, đổi một ký tự, đảo thứ tự một scalar list, lệch một mili giây, lệch 1e-8 ở `Float`, tạo một orphan FK. Mỗi loại phải bị bắt bởi đúng phép kiểm tra tương ứng.
- `precheck` chặn đúng từng loại vi phạm trong bảng precheck.
- `copy` idempotent: chạy hai lần cho cùng kết quả.

### Acceptance

Diễn tập đầy đủ trong Acceptance_Environment với dữ liệu có hình dạng như production: khôi phục backup, `migrate deploy`, `copy`, `validate`, cutover, chạy mười Critical_Flow (requirement 9.1–9.10), `reverse-copy`, rollback. Đo thời lượng Write_Freeze và dùng số đo đó làm ngưỡng trong Approved_Cutover_Plan.

Hai script `scripts/seeder_parent_category.js` và `scripts/seeder_category.js` chạy qua API trên Acceptance_Environment để xác nhận tên danh mục tiếng Việt và quan hệ parent-child hoạt động (requirement 9.10). Hai script này gọi API nên không cần sửa.

---

## Danh sách file bị ảnh hưởng

### Bắt buộc sửa

| Nhóm                | Số file | Đường dẫn                                                                                                 |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| Prisma schema       | 9       | `apps/services/{ai,catalog,iam,order,payment,promotion,shop,utility,wallet}-service/prisma/schema.prisma` |
| Prisma runtime      | 9       | `apps/services/*/src/app/prisma/prisma.service.ts`                                                        |
| Nx project target   | 9       | `apps/services/*/project.json`                                                                            |
| Dependency          | 2       | `package.json`, `pnpm-lock.yaml`                                                                          |
| Cấu hình database   | 1       | `libs/configurations/src/lib/database.config.ts`                                                          |
| Biến môi trường mẫu | 1       | `.env.example`                                                                                            |
| Video repository    | 1       | `apps/services/utility-service/src/app/modules/video/repositories/video.repository.ts`                    |
| CI                  | 1       | `.github/workflows/push.yml`                                                                              |

### Sửa do đổi biểu diễn scalar list

| File                                                                                        | Trường         |
| ------------------------------------------------------------------------------------------- | -------------- |
| `apps/services/ai-service/.../review-summary/repositories/review-summary.repository.ts`     | `pros`, `cons` |
| `apps/services/ai-service/.../review-summary/controllers/review-summary-grpc.controller.ts` | `pros`, `cons` |
| `apps/services/ai-service/.../review-summary/services/review-summary.service.ts`            | `pros`, `cons` |
| `apps/services/catalog-service/.../product/repositories/product.repository.ts`              | `images`       |
| `apps/services/utility-service/.../review/repositories/review.repository.ts`                | `mediaUrls`    |
| `apps/services/utility-service/.../report/repositories/report.repository.ts`                | `media`        |
| `apps/services/promotion-service/.../redemption/repositories/redemption.repository.ts`      | `orderIds`     |
| `apps/services/payment-service/.../payment/repositories/payment.repository.ts`              | `orderId`      |
| `apps/services/payment-service/.../transaction/services/transaction.service.ts`             | `orderId`      |
| `apps/services/iam-service/.../user/repositories/user.repository.ts`                        | `group`        |
| `apps/services/iam-service/.../user/services/user.service.ts`                               | `group`        |
| `apps/services/iam-service/.../user/services/user-consumer.service.ts`                      | `group`        |

### Sửa do bỏ `mode: 'insensitive'`

`catalog-service` product repository, `order-service` order repository, `payment-service` payment repository, `promotion-service` promotion repository, `shop-service` shop repository, `shop-service` merchant repository.

### File mới

| Đường dẫn                                              | Mục đích                            |
| ------------------------------------------------------ | ----------------------------------- |
| `libs/utils/src/lib/scalar-list.util.ts`               | `ScalarListCodec`                   |
| `libs/utils/src/lib/shuffle.util.ts`                   | Fisher–Yates với `crypto.randomInt` |
| `libs/utils/src/lib/mask-database-error.util.ts`       | Che credential trong log            |
| `libs/configurations/src/lib/mysql-adapter.config.ts`  | `buildMysqlAdapterConfig`           |
| `libs/interceptors/src/lib/maintenance.interceptor.ts` | Write_Freeze                        |
| `libs/db-migration/**`                                 | Công cụ migration dữ liệu           |
| `tools/migration-guard/check-destructive.ts`           | Guard CI                            |
| `apps/services/*/prisma/migrations/**`                 | 9 bộ versioned migration            |
| `vitest.workspace.ts` và cấu hình test                 | Thiết lập kiểm thử                  |

### Không đổi

`libs/schemas` (toàn bộ zod schema), `libs/interfaces` (proto types và model), BFF, frontend, Convex, Redis, S3, SQS, `scripts/seeder_*.js`. Đây là hệ quả chủ đích của quyết định giữ hợp đồng bất biến (requirement 1.5).

### Ngoài repository

Kubernetes Secret và Deployment manifest, Job chạy `prisma migrate deploy`, provisioning MySQL, và chính sách retention image ECR (`KEEP` trong `push.yml` nằm trong repo nhưng quyết định giá trị là quyết định vận hành).

---

## Truy vết requirement

| Requirement                                         | Phần thiết kế                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1.1 – 1.4 Phạm vi chín Service_Database             | "Nền tảng đích", "Chuyển đổi Prisma runtime và dependency", "Cấu hình môi trường"            |
| 1.5 Giữ hợp đồng                                    | Nguyên tắc thiết kế 1; "Danh sách file bị ảnh hưởng — Không đổi"                             |
| 2.1 Provider mysql, validate                        | "Chuyển đổi Prisma runtime"; job `check-schema`                                              |
| 2.2 30 model, 27 enum                               | "Ma trận ánh xạ kiểu dữ liệu"; test integration                                              |
| 2.3 Bảo toàn cấu trúc                               | "Ma trận ánh xạ", "Giới hạn độ dài index"                                                    |
| 2.4 Biểu diễn tương thích cho 8 scalar list         | "Thiết kế lại scalar list"                                                                   |
| 2.5 Bảo toàn thứ tự, trùng lặp, Unicode             | `ScalarListCodec`; test tính chất. **Ngoại lệ tuyên bố: `User.group` không bảo toàn thứ tự** |
| 2.6 Bảo toàn JSON                                   | "Khác biệt JSON"; Canonical_Record                                                           |
| 2.7 UUID và autoincrement                           | "Ánh xạ trực tiếp"; `fix-sequence`                                                           |
| 2.8 Kiểu chứa được giới hạn độ dài                  | "Chuẩn hóa độ dài chuỗi"; precheck                                                           |
| 3.1 – 3.3 Adapter và dependency                     | "Adapter"                                                                                    |
| 3.4 – 3.5 generate và build                         | job `check-schema`; target `build` không đổi                                                 |
| 3.6 Health-check khi khởi động                      | `onModuleInit` trong `prisma.service.ts`                                                     |
| 3.7 Dừng với URL sai giao thức, không lộ credential | `mysqlUrl` trong `database.config.ts`; `maskDatabaseError`                                   |
| 4.1 – 4.2 Versioned migration                       | "Quản lý schema có version"                                                                  |
| 4.3 Dừng trước thay đổi mất dữ liệu                 | `check-destructive.ts`                                                                       |
| 4.4 Phân biệt target chấp nhận mất dữ liệu          | Bảng bốn target; `reset-local` có guard                                                      |
| 4.5 CI xác nhận migration                           | job `check-schema`                                                                           |
| 5.1 – 5.4 Hành vi video feed                        | "Thiết kế lại truy vấn video feed"                                                           |
| 5.5 Tham số hóa `excludeIds`                        | Bỏ hoàn toàn raw SQL; test injection                                                         |
| 5.6 Tương thích dialect                             | Không còn SQL viết tay; ESLint chặn `*Unsafe`                                                |
| 6.1 – 6.2 Baseline_Manifest                         | `inventory`                                                                                  |
| 6.3 Copy cả soft-deleted                            | `copy` đọc raw SQL, không lọc                                                                |
| 6.4 – 6.11 Đối soát                                 | `validate`; Canonical_Record                                                                 |
| 6.12 Chặn Cutover khi thất bại                      | `overall: fail`; cổng chặn bước 10                                                           |
| 7.1 – 7.3 utf8mb4 và collation                      | "Chiến lược collation"                                                                       |
| 7.4 Parity `contains`                               | `as_ci` trên 7 cột; tầng test parity                                                         |
| 7.5 Parity lọc `group`                              | Bảng `UserGroup`; tầng test parity                                                           |
| 7.6 Enum                                            | "Ánh xạ trực tiếp"                                                                           |
| 7.7 JSON                                            | "Khác biệt JSON"; test integration                                                           |
| 7.8 Referential_Action                              | "Ánh xạ trực tiếp"; test integration                                                         |
| 7.9 Chặn khi vi phạm giới hạn                       | `precheck`                                                                                   |
| 8.1 – 8.2 Backup và diễn tập khôi phục              | Bước 1 – 2                                                                                   |
| 8.3 – 8.4 Write_Freeze                              | "Write_Freeze"; `MaintenanceInterceptor`                                                     |
| 8.5 Validation trước khi chuyển traffic             | Bước 10                                                                                      |
| 8.6 Kết thúc freeze sau Critical_Flow               | Bước 12 – 13                                                                                 |
| 8.7 – 8.8 Rollback                                  | "Rollback", hai chế độ                                                                       |
| 8.9 Audit                                           | `cutover-log.json`                                                                           |
| 9.1 – 9.10 Critical_Flow                            | Bước 12; tầng Acceptance                                                                     |
| 9.11 Bộ hồi quy                                     | "Chiến lược kiểm thử". Bộ này phải được tạo mới                                              |
| 10.1 – 10.2 Biến môi trường và kiểm tra             | `mysqlUrl`                                                                                   |
| 10.3 – 10.6 Secret store và rotate                  | "Credential"                                                                                 |
| 10.7 Che log                                        | `maskDatabaseError`; sửa `console.error` hiện tại                                            |
| 10.8 TLS                                            | `buildMysqlAdapterConfig`                                                                    |
| 11.1 – 11.5 Tài liệu                                | "Bàn giao tài liệu"                                                                          |

---

## Bàn giao tài liệu

| Tài liệu                           | Nội dung                                                                                        | Requirement |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| Cập nhật `README.md`               | Thay mô tả Neon PostgreSQL bằng MySQL cho chín Service_Database                                 | 11.1        |
| `docs/runbook-mysql-migration.md`  | Backup, precheck, migrate, copy, validate, cutover, rollback, kèm lệnh cụ thể và cổng chặn      | 11.2        |
| `docs/type-mapping-matrix.md`      | Trích xuất từ mục "Ma trận ánh xạ kiểu dữ liệu" của tài liệu này thành tài liệu tra cứu độc lập | 11.3        |
| `docs/affected-files.md`           | Trích xuất từ mục "Danh sách file bị ảnh hưởng"                                                 | 11.4        |
| `reports/baseline-manifest-*.json` | Số bản ghi thực tế từng model, sinh bởi `inventory`, phê duyệt trước khi chốt kế hoạch Cutover  | 11.5        |

---

## Rủi ro

### Đã kiểm chứng trong repository

| Rủi ro                                                                       | Mức        | Xử lý                                                     |
| ---------------------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| `Permission.@@unique([path, method, group])` vượt 3072 byte, chặn tạo schema | Cao        | Giảm `path` xuống `VarChar(500)`, xác nhận bằng precheck  |
| 22 trường `String` không annotate bị co từ `text` xuống `VarChar(191)`       | Cao        | Chuẩn hóa độ dài tường minh + precheck `MAX(CHAR_LENGTH)` |
| `mode: 'insensitive'` không tồn tại trên MySQL, 6 vị trí sẽ vỡ               | Cao        | Bỏ tham số, chuyển sang collation `as_ci`, test parity    |
| Chọn `ai_ci` sẽ làm `contains` khớp cả khác dấu, sai ngữ nghĩa tiếng Việt    | Trung bình | Chọn `as_ci`, có test khẳng định không khớp khác dấu      |
| `excludeIds` nội suy chuỗi trong video feed là SQL injection                 | Cao        | Bỏ raw SQL                                                |
| Không có versioned migration, chỉ `db push --accept-data-loss`               | Cao        | Bốn target mới + guard CI                                 |
| Khác biệt isolation level ảnh hưởng 14 transaction đọc–sửa–ghi               | Trung bình | Đặt `READ-COMMITTED` ở cấp server                         |
| Không có framework test, requirement 9.11 không thực thi được                | Cao        | Thiết lập Vitest là phần của công việc                    |
| `zod` error hiện in nguyên database URL kèm password vào log                 | Trung bình | Sửa khối xử lý lỗi trong `database.config.ts`             |
| ECR prune giữ 1 image sẽ xóa image rollback                                  | Trung bình | Nâng `KEEP` hoặc tag bảo vệ trước Cutover                 |
| CI không có bước áp dụng schema                                              | Trung bình | Thêm Job `migrate deploy` trước rollout                   |
| `_ProductCategories` không phải model nên dễ bị bỏ khi copy                  | Trung bình | Đưa tường minh vào kế hoạch copy                          |
| `Category` self-FK cần copy theo tầng                                        | Thấp       | Kế hoạch copy theo độ sâu                                 |

### Từ nguồn bên ngoài, chưa tái hiện trên dự án

| Rủi ro                                                                                                                                 | Xử lý                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Có báo cáo công khai rằng `idleTimeout` của `@prisma/adapter-mariadb` bị bỏ qua trong một số bản Prisma 7, gây đọng connection `Sleep` | Ghim phiên bản chính xác, đặt tham số pool tường minh, quan sát `SHOW PROCESSLIST` trong Acceptance_Environment |

### Chưa kiểm chứng được

Những điểm sau ảnh hưởng thiết kế nhưng không xác định được từ repository. Chúng phải được làm rõ trước khi lập tasks:

1. **Manifest triển khai và credential.** Không có Helm chart hay k8s manifest nào trong repository; pipeline chỉ `kubectl rollout restart`. Nhận định trong `requirements.md` về "Helm manifest chứa credential dạng rõ" không kiểm chứng được ở đây. Cần quét lịch sử git để biết credential có từng được commit.
2. **Số lượng bản ghi và độ dài giá trị thực tế.** Toàn bộ quyết định độ dài `VarChar` là giả thiết cho tới khi `precheck` chạy trên dữ liệu thật. Ngân sách thời lượng Write_Freeze cũng phụ thuộc số liệu này.
3. **Hạ tầng MySQL đích.** RDS, Aurora, hay self-hosted. Ảnh hưởng cách cấu hình `transaction_isolation` và `sql_mode` (parameter group với RDS, `my.cnf` với self-hosted) và cách cấp TLS CA.
4. **Nội dung dữ liệu JSON hiện tại.** Đã đọc năm zod schema mô tả hình dạng mong đợi, nhưng chưa xác nhận dữ liệu thật tuân theo. `precheck` sẽ trả lời.
5. **Ngưỡng thời lượng Write_Freeze được nghiệp vụ chấp nhận.** Cần cho Approved_Cutover_Plan và cho quyết định có tách bước 5 sâu hơn nữa hay không.
