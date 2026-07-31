# Implementation Plan

## Overview

Kế hoạch chuyển chín Service_Database từ PostgreSQL sang MySQL 8.0, gồm 19 task được sắp theo phụ thuộc thật.

Task 1–3 giữ repository build được và vẫn chạy PostgreSQL. Task 4–10 là khối thay đổi lớn; repository sẽ không build được ở giữa khối này. Task 11 là điểm kiểm tra đầu tiên xác nhận khối đó hoàn chỉnh. Task 19 là thao tác vận hành có phê duyệt của con người, không tự động hóa toàn phần.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1"],
      "description": "Hạ tầng kiểm thử. Không phụ thuộc gì, repository vẫn chạy PostgreSQL."
    },
    {
      "wave": 2,
      "tasks": ["2", "3"],
      "description": "Lớp dùng chung trong libs và khung công cụ migration cùng lần chạy precheck. Chạy song song được vì độc lập nhau.",
      "dependsOn": ["1"]
    },
    {
      "wave": 3,
      "tasks": ["4"],
      "description": "Chuyển chín Prisma schema. Phụ thuộc kết quả precheck để chốt độ dài VarChar và phương án Permission.path.",
      "dependsOn": ["3"]
    },
    {
      "wave": 4,
      "tasks": ["5"],
      "description": "Dependency và Prisma runtime. Phụ thuộc schema đã đổi provider.",
      "dependsOn": ["4"]
    },
    {
      "wave": 5,
      "tasks": ["6", "7", "8", "9", "10"],
      "description": "Versioned migration, siết cấu hình database, và toàn bộ sửa mã ứng dụng. Chạy song song được vì tác động lên các file khác nhau.",
      "dependsOn": ["2", "5"]
    },
    {
      "wave": 6,
      "tasks": ["11"],
      "description": "Cổng chặn. Generate, build, migrate-deploy và unit test phải pass hết.",
      "dependsOn": ["6", "7", "8", "9", "10"]
    },
    {
      "wave": 7,
      "tasks": ["12", "13", "14", "15"],
      "description": "Integration, parity, hoàn thiện công cụ migration, cơ chế Write_Freeze. Bốn task độc lập nhau.",
      "dependsOn": ["11"]
    },
    {
      "wave": 8,
      "tasks": ["16", "17"],
      "description": "Cập nhật CI và tài liệu.",
      "dependsOn": ["12", "13", "14", "15"]
    },
    {
      "wave": 9,
      "tasks": ["18"],
      "description": "Cổng chặn. Diễn tập đầy đủ trong Acceptance_Environment.",
      "dependsOn": ["16", "17"]
    },
    {
      "wave": 10,
      "tasks": ["19"],
      "description": "Cutover production. Thao tác vận hành có phê duyệt của con người ở từng cổng chặn.",
      "dependsOn": ["18"]
    }
  ]
}
```

Ba phụ thuộc quan trọng, dễ bị làm sai thứ tự:

- **3 → 4.** Kết quả precheck quyết định bảng độ dài `VarChar` và quyết định phương án cho `Permission.path`. Đổi schema trước khi có số liệu là đoán.
- **2 → 8, 9.** `ScalarListCodec` phải tồn tại và có kiểm thử tính chất trước khi sửa repository, nếu không mỗi service sẽ tự viết một cách map khác nhau.
- **6 → 11, 12.** Collation nằm trong migration SQL, không trong `schema.prisma`. Test integration chạy trước khi có migration collation sẽ cho kết quả sai về Property 11.

Task 12, 13, 14, 15 độc lập với nhau và chạy song song được sau Task 11.

## Tasks

- [ ] 1. Thiết lập hạ tầng kiểm thử
  - Thêm Vitest cho workspace: `vitest`, `@vitest/coverage-v8`, cấu hình `vitest.workspace.ts` tại root.
  - Thêm target `test` cho chín service và cho `libs/utils`, `libs/configurations`, `libs/db-migration`.
  - Thêm `fast-check` cho kiểm thử tính chất.
  - Thêm `testcontainers` cho tầng integration và parity.
  - Xác nhận `pnpm nx run-many -t test` chạy được và pass với 0 test.
  - Repository vẫn chạy PostgreSQL sau task này, không sửa bất kỳ file nguồn nào của service.
  - _Requirements: 9.11_

- [ ] 2. Xây các lớp dùng chung trong `libs`
  - [ ] 2.1 `libs/utils/src/lib/scalar-list.util.ts`: `readStringList`, `writeStringList` theo hợp đồng tại mục Components and Interfaces. `readStringList` ném lỗi kèm tên model, tên trường, khóa bản ghi khi gặp giá trị không phải mảng chuỗi; không trả `[]`.
  - [ ] 2.2 Kiểm thử tính chất cho `ScalarListCodec` bằng `fast-check`. Miền sinh phải gồm mảng rỗng, phần tử trùng lặp, chuỗi rỗng, tiếng Việt có dấu, ký tự bốn byte, phần tử dài 1000 ký tự, mảng 100 phần tử.
    - _Supports: Property 1, Property 2_
  - [ ] 2.3 `libs/utils/src/lib/shuffle.util.ts`: Fisher–Yates dùng `crypto.randomInt`, không mutate input. Không dùng `Math.random()`.
  - [ ] 2.4 Kiểm thử tính chất cho `shuffle`: output là đa tập bằng input, input không đổi.
    - _Supports: Property 8_
  - [ ] 2.5 `libs/utils/src/lib/mask-database-error.util.ts`: che username, password, host, query parameter, certificate material trong mọi hình dạng lỗi (`Error`, object có `message`, string).
  - [ ] 2.6 Kiểm thử tính chất cho `maskDatabaseError`: với mọi URL có credential, output không chứa password và username, kể cả khi credential đã percent-encode.
    - _Supports: Property 13_
  - [ ] 2.7 `libs/configurations/src/lib/mysql-adapter.config.ts`: `buildMysqlAdapterConfig(url)` trả config cho `PrismaMariaDb`, đặt `ssl: { rejectUnauthorized: true }`, nạp CA từ biến môi trường khi có, và đặt `connectionLimit`, `idleTimeout`, `acquireTimeout` tường minh.
  - Repository vẫn chạy PostgreSQL sau task này. Các lớp mới chưa được service nào dùng.
  - _Requirements: 2.4, 2.5, 5.4, 10.7, 10.8_

- [ ] 3. Khung công cụ migration và chạy precheck trên dữ liệu hiện tại
  - [ ] 3.1 Tạo Nx library `libs/db-migration` với `cli.ts` và bộ khung `core/` (`canonical.ts`, `checksum.ts`, `plan.ts`, `transform.ts`, `report.ts`).
  - [ ] 3.2 `core/canonical.ts`: Canonical_Record theo bảng quy tắc chuẩn hóa trong design. `Float` dùng `toFixed(9)`, `DateTime` dùng ISO-8601 UTC ba chữ số mili giây, `Json` sắp khóa đệ quy, scalar list giữ nguyên thứ tự.
  - [ ] 3.3 Kiểm thử tính chất cho `canonical`: cùng chuỗi bất kể thứ tự khóa đầu vào.
    - _Supports: Property 3_
  - [ ] 3.4 `core/checksum.ts`: SHA-256 mỗi bản ghi trên chuỗi canonical có nối tên cột; checksum bảng là XOR toàn bộ row hash cộng số bản ghi.
  - [ ] 3.5 Kiểm thử tính chất cho checksum: không đổi khi đổi thứ tự đọc hoặc số worker.
    - _Supports: Property 5_
  - [ ] 3.6 `core/plan.ts` và chín file `plans/*.ts`: thứ tự bảng theo phụ thuộc FK đúng như bảng trong design. Phải bao gồm `_ProductCategories` và xử lý self-FK của `Category` theo tầng.
  - [ ] 3.7 `commands/precheck.ts`: chín nhóm kiểm tra trong bảng precheck của design. Exit khác 0 khi có vi phạm, xuất danh sách service, model, trường, khóa bản ghi.
  - [ ] 3.8 Kiểm thử `precheck` bắt đúng từng loại vi phạm được tiêm vào.
  - [ ] 3.9 Chạy `precheck` trên chín Source_Database thật. Xuất báo cáo gồm `MAX(CHAR_LENGTH)` từng cột chuỗi, `MAX(CHAR_LENGTH(path))` của `Permission`, danh sách trùng lặp không phân biệt hoa thường trên cột unique, phần tử trùng trong `User.group`, orphan FK có sẵn.
  - [ ] 3.10 Chốt bảng độ dài `VarChar` cuối cùng dựa trên số liệu bước 3.9. Nếu `MAX(CHAR_LENGTH(path))` vượt 500, chuyển `Permission` sang phương án cột hash và ghi lại quyết định.
  - [ ] 3.11 Nếu có orphan FK trên PostgreSQL, sửa dữ liệu nguồn trước khi tiếp tục. Không copy rồi mới xử lý.
  - **Cổng chặn: precheck phải pass hoặc mọi vi phạm phải được xử lý trước khi sang Task 4.**
  - _Requirements: 6.1, 6.2, 6.5, 7.9, 2.8_

- [ ] 4. Chuyển chín Prisma schema sang MySQL
  - [ ] 4.1 Đổi `datasource db` sang `provider = "mysql"` trong cả chín `prisma/schema.prisma`. Không đổi `generator client`, giữ `binaryTargets`, giữ `prisma-json-types-generator` ở năm service đang dùng.
  - [ ] 4.2 Áp dụng bảng độ dài đã chốt ở bước 3.10 cho toàn bộ trường `String` chưa có `@db.*`. Khóa và khóa ngoại UUID dùng `@db.VarChar(36)`.
  - [ ] 4.3 Nâng `Product.description`, `Product.sizeGuide`, `Transaction.body`, `Transaction.transactionContent` lên `@db.MediumText`. Đặt `ReviewSummary.summary` thành `@db.VarChar(2000)`.
  - [ ] 4.4 Giảm `Permission.path` xuống `@db.VarChar(500)` theo quyết định bước 3.10.
  - [ ] 4.5 Đổi bảy trường nhóm A sang `Json`: `ReviewSummary.pros`, `ReviewSummary.cons`, `Product.images`, `Report.media`, `Review.mediaUrls`, `Redemption.orderIds`, `Payment.orderId`. Bỏ `@default([])` ở `Report.media` và `Review.mediaUrls`; giá trị mặc định do `ScalarListCodec` cấp.
  - [ ] 4.6 Bỏ `@@index([orderId])` khỏi `Payment` và ghi lý do vào ma trận ánh xạ.
  - [ ] 4.7 Thêm model `UserGroup` vào `iam-service` với `@@id([userId, group])`, `@@index([group])`, `onDelete: Cascade`. Đổi `User.group GROUP[]` thành quan hệ `groups UserGroup[]`.
  - [ ] 4.8 Chạy `prisma validate` cho cả chín schema. Phải pass hết.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8_

- [ ] 5. Chuyển dependency và Prisma runtime
  - [ ] 5.1 `package.json`: bỏ `@prisma/adapter-pg`, thêm `"@prisma/adapter-mariadb": "7.6.0"` ghim phiên bản chính xác. Chạy `pnpm install`, commit cả `pnpm-lock.yaml`.
  - [ ] 5.2 Xác nhận `pnpm why @prisma/adapter-pg` không trả kết quả nào.
  - [ ] 5.3 Sửa chín `src/app/prisma/prisma.service.ts`: dùng `PrismaMariaDb` với `buildMysqlAdapterConfig`, thêm `implements OnModuleInit` và health-check `SELECT 1`, log lỗi qua `maskDatabaseError` rồi ném lỗi nêu tên service.
  - [ ] 5.4 Chín `prisma.config.ts` không đổi cấu trúc; xác nhận vẫn đọc đúng chín biến môi trường hiện có.
  - [ ] 5.5 Chạy `pnpm nx run-many -t generate-prisma` cho chín service. Phải không lỗi.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 10.1_

- [ ] 6. Sinh versioned migration và thay target quản lý schema
  - [ ] 6.1 Với từng service, sinh migration khởi tạo bằng `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` vào `prisma/migrations/<timestamp>_init_mysql/migration.sql`.
  - [ ] 6.2 Thêm migration thứ hai cho từng service đặt charset, collation và row format: `CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs` cấp table, `ROW_FORMAT=DYNAMIC`, và `COLLATE utf8mb4_0900_as_ci` tường minh trên bảy cột `Product.name`, `Shop.name`, `Merchant.legalName`, `Promotion.name`, `Order.code`, `Payment.code`, `Promotion.code`.
  - [ ] 6.3 Ghi `prisma/README.md` cho từng service nêu rõ collation được quản lý bởi migration chứ không bởi `schema.prisma`, kèm cách xử lý khi `migrate dev` báo drift.
  - [ ] 6.4 Thay bốn target trong chín `project.json`: `migrate-dev`, `migrate-deploy`, `migrate-status`, `reset-local`. Xóa `push-prisma` và `push-prisma-acl`.
  - [ ] 6.5 Viết script guard cho `reset-local`: thoát với lỗi nếu `NODE_ENV` khác `development` hoặc host trong database URL không thuộc allowlist local.
  - [ ] 6.6 `tools/migration-guard/check-destructive.ts`: quét diff migration, tìm `DROP TABLE`, `DROP COLUMN`, `DROP INDEX`, `TRUNCATE`, `MODIFY ... NOT NULL`, `RENAME COLUMN`, `CHANGE COLUMN`; exit khác 0 nếu thiếu đánh dấu `-- kiro:allow-destructive:`.
  - [ ] 6.7 Kiểm thử `check-destructive` với migration hợp lệ, migration phá hủy không đánh dấu, và migration phá hủy có đánh dấu.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.3_

- [ ] 7. Siết cấu hình database và xử lý credential
  - [ ] 7.1 `libs/configurations/src/lib/database.config.ts`: thay `z.string()` bằng `mysqlUrl(expectedDatabase)` cho chín biến, kiểm giao thức `mysql:` và tên database khớp service.
  - [ ] 7.2 Sửa khối xử lý lỗi hiện tại. `console.error(configServer.error)` đang in nguyên giá trị input, nghĩa là database URL kèm password bị ghi ra log. Thay bằng in danh sách tên biến sai kèm message, không in giá trị.
  - [ ] 7.3 Kiểm thử: URL `postgresql://` bị từ chối, URL trỏ sai tên database bị từ chối, và thông điệp lỗi không chứa password.
    - _Supports: Property 13_
  - [ ] 7.4 `.env.example`: đổi chín giá trị mẫu sang dạng `mysql://user:pass@host:3306/<tên_database>`. Giữ nguyên tên biến.
  - [ ] 7.5 Quét lịch sử git (`git log -p -S 'postgresql://'`) xác định credential PostgreSQL có từng được commit. Ghi kết quả vào runbook. Nếu có, rotate là bắt buộc.
  - _Requirements: 3.7, 10.1, 10.2, 10.7_

- [ ] 8. Sửa mã ứng dụng dùng scalar list nhóm A
  - [ ] 8.1 `ai-service`: `review-summary.repository.ts` bọc `pros`, `cons` bằng `writeStringList` ở cả `create` và `update` của `upsert`. `review-summary.service.ts` và `review-summary-grpc.controller.ts` map kết quả đọc qua `readStringList` trước khi trả response.
  - [ ] 8.2 `catalog-service`: `product.repository.ts` map `images` tường minh ở `create` và `update` thay vì để đi qua spread `Prisma.ProductCreateInput`; map ngược ở `list`, `getOne`, `findById` và mọi hàm đọc khác.
  - [ ] 8.3 `utility-service`: `review.repository.ts` cho `mediaUrls`, `report.repository.ts` cho `media`, cả chiều ghi và chiều đọc.
  - [ ] 8.4 `promotion-service`: `redemption.repository.ts` cho `orderIds` tại năm vị trí — so sánh tập, hợp nhất bằng `Set`, `create`, `update`, khởi tạo `[]`. Đọc qua `readStringList` trước khi so sánh.
  - [ ] 8.5 `payment-service`: `payment.repository.ts` map `orderId` ở `create`; `transaction.service.ts` đổi `payment.orderId?.length` thành `readStringList(payment.orderId).length`.
  - [ ] 8.6 Xác nhận `libs/schemas` và `libs/interfaces` **không** bị sửa. `ProductSchema.images`, `ReviewSchema.mediaUrls`, `PromotionRedemptionSchema.orderIds` vẫn là `z.array(...)`, và proto `images: string[]` giữ nguyên.
  - _Requirements: 1.5, 2.4, 2.5_

- [ ] 9. Sửa `iam-service` cho `User.group`
  - [ ] 9.1 `user.repository.ts`: thêm mapper duy nhất `toUserResponse(row)` làm phẳng `groups[].group` về `group: string[]`. Bắt buộc mọi hàm đọc User đi qua mapper này.
  - [ ] 9.2 `user.repository.ts` `list`: đổi `{ hasSome: data.group }` thành `{ groups: { some: { group: { in: data.group } } } }`.
  - [ ] 9.3 `user.repository.ts` `create`: đổi `group: [...]` thành `groups: { create: data.group.map(group => ({ group })) }`.
  - [ ] 9.4 `user.repository.ts` `update`: cập nhật tập hợp bằng `deleteMany` + `createMany` trong một transaction. Không dùng `set`.
  - [ ] 9.5 `user.service.ts` `update`: đổi `oldUser.group` thành `oldUser.groups.map(g => g.group)`. Logic diff Cognito `groupsToAdd` và `groupsToRemove` giữ nguyên vì đã làm việc trên `string[]`. Xóa hai `console.log` credential-adjacent hiện có.
  - [ ] 9.6 `user-consumer.service.ts`: đổi `group: [GroupValues.CUSTOMER]` thành nested create.
  - [ ] 9.7 Xác nhận `libs/schemas/src/lib/iam/user.schema.ts` không bị sửa; `group: z.array(GroupEnums)` vẫn là hợp đồng.
  - _Requirements: 1.5, 2.4, 7.5_

- [ ] 10. Bỏ `mode: 'insensitive'` và viết lại video feed
  - [ ] 10.1 Bỏ tham số `mode` tại sáu vị trí: `catalog-service` product repository, `order-service` order repository, `payment-service` payment repository, `promotion-service` promotion repository (hai chỗ), `shop-service` shop repository, `shop-service` merchant repository. Không thay bằng gì khác; tính không phân biệt hoa thường do collation `as_ci` ở Task 6.2 cấp.
  - [ ] 10.2 Viết lại `video.repository.ts` `feed` theo thiết kế: hai lần gọi Prisma có kiểu, `MAX_FEED_LIMIT = 50`, dùng `shuffle` từ `libs/utils`. Bỏ hoàn toàn `$queryRawUnsafe`.
  - [ ] 10.3 Thêm quy tắc ESLint `no-restricted-syntax` chặn `$queryRawUnsafe` và `$executeRawUnsafe` trên toàn workspace.
  - [ ] 10.4 Xác nhận `$queryRawUnsafe` không còn xuất hiện ở đâu ngoài build artifact.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.4_

- [ ] 11. Điểm kiểm tra thứ nhất — build và schema
  - Chạy `pnpm nx run-many -t generate-prisma` cho chín service, phải exit 0.
  - Chạy `pnpm nx run-many -t build` cho chín service, phải exit 0.
  - Khởi động MySQL 8.0 cục bộ với `utf8mb4`, `STRICT_ALL_TABLES`, `READ-COMMITTED`, `ROW_FORMAT=DYNAMIC`. Chạy `migrate-deploy` cho chín service, phải không lỗi. Đặc biệt xác nhận unique index của `Permission` tạo thành công.
  - Chạy `pnpm nx run-many -t test`, toàn bộ unit test pass.
  - **Dừng và báo cáo nếu bất kỳ bước nào thất bại. Không vá đoán.**
  - _Requirements: 2.1, 3.4, 3.5, 4.2_

- [ ] 12. Kiểm thử integration trên MySQL thật
  - [ ] 12.1 Dựng helper testcontainer MySQL 8.0 cấu hình đúng như production, schema tạo bằng `migrate-deploy` để test chính đường dẫn deploy.
  - [ ] 12.2 Test tạo đủ 30 model và 27 enum; test hồi quy riêng cho unique index của `Permission` không vượt 3072 byte.
  - [ ] 12.3 Round-trip tám scalar list qua repository thật.
    - _Supports: Property 1, Property 2_
  - [ ] 12.4 Round-trip năm trường JSON, khẳng định string, number, boolean, null, array, object giữ đúng kiểu.
  - [ ] 12.5 Lưu và đọc chuỗi tiếng Việt, ký tự bốn byte, chuỗi rỗng.
  - [ ] 12.6 Test `contains` trên bảy cột `as_ci`: khớp khi khác hoa thường, **không** khớp khi khác dấu.
    - _Supports: Property 11_
  - [ ] 12.7 Test unique constraint `User.email` phân biệt hoa thường.
  - [ ] 12.8 Test lọc `User` qua `UserGroup` với mọi tập con của `GROUP`, gồm tập rỗng.
    - _Supports: Property 12_
  - [ ] 12.9 Test Referential_Action: Cascade xóa con, SetNull đặt null, NoAction chặn.
  - [ ] 12.10 Test `Transaction` AUTO_INCREMENT tiếp tục đúng sau khi seed dữ liệu có `id` tường minh.
  - [ ] 12.11 Test `feed`: ba điều kiện lọc, loại `excludeIds`, tôn trọng limit, và `excludeIds` chứa `'`, `"`, `;`, `--`, `\`, `%`, `_` không làm vỡ truy vấn.
    - _Supports: Property 9, Property 10_
  - _Requirements: 2.2, 5.1, 5.2, 5.3, 5.5, 6.8, 7.1, 7.2, 7.6, 7.7, 7.8_

- [ ] 13. Kiểm thử parity PostgreSQL với MySQL
  - [ ] 13.1 Dựng harness chạy cùng một hàm repository trên hai container PostgreSQL 16 và MySQL 8 đã seed cùng fixture, so tập khóa bản ghi trả về.
  - [ ] 13.2 Fixture phải chứa: tên sản phẩm khác hoa thường, tên khác dấu (`Cà phê` / `Ca phe` / `CÀ PHÊ`), mã đơn khác hoa thường, người dùng nhiều group và một group, bản ghi soft-deleted.
  - [ ] 13.3 Chạy parity cho bảy hàm `contains` và một hàm lọc `group`.
    - _Supports: Property 11, Property 12_
  - Phạm vi giới hạn ở tám hàm này. Không cố phủ toàn bộ repository.
  - _Requirements: 7.4, 7.5_

- [ ] 14. Hoàn thiện công cụ migration dữ liệu
  - [ ] 14.1 `commands/inventory.ts`: sinh Baseline_Manifest cho từng model gồm số bản ghi, checksum Canonical_Record, khóa nhỏ nhất, khóa lớn nhất, aggregate tài chính áp dụng được.
  - [ ] 14.2 `core/transform.ts`: ba phép biến đổi `String[]` sang JSON array, `User.group` sang nhiều dòng `UserGroup`, `jsonb` sang `JSON`. Mọi kiểu khác đi thẳng.
  - [ ] 14.3 `commands/copy.ts`: phân trang keyset trên khóa chính, lô 1000 dòng, đọc bằng raw SQL trên PostgreSQL để lấy cả bản ghi soft-deleted, ghi bằng `INSERT ... ON DUPLICATE KEY UPDATE`, giữ kiểm tra FK bật, retry backoff cho lỗi tạm thời, dừng ngay với lỗi ràng buộc.
  - [ ] 14.4 Kiểm thử `copy` idempotent: chạy n lần cho cùng trạng thái đích như chạy một lần.
    - _Supports: Property 6_
  - [ ] 14.5 `commands/fix-sequence.ts`: `ALTER TABLE Transaction AUTO_INCREMENT = max+1`.
  - [ ] 14.6 `commands/validate.ts`: toàn bộ phép kiểm tra trong cấu trúc Validation_Report của design. Tổng 11 trường tài chính `Int` phải khớp chính xác, không ngưỡng sai số. `overall: fail` khi có bất kỳ kiểm tra thất bại, kèm danh sách service, model, khóa bản ghi, phép kiểm tra.
    - _Supports: Property 15_
  - [ ] 14.7 Kiểm thử `validate` bắt đúng từng lỗi được tiêm: xóa một dòng, đổi một ký tự, đảo thứ tự một scalar list, lệch một mili giây, lệch 1e-8 ở `Float`, tạo một orphan FK.
    - _Supports: Property 4_
  - [ ] 14.8 `commands/reverse-copy.ts`: biến đổi nghịch JSON array sang `String[]` và `UserGroup` sang `User.group`.
  - [ ] 14.9 Kiểm thử `reverse-copy(copy(x))` bằng `x` ở tầng dữ liệu logic, trừ thứ tự `User.group`.
    - _Supports: Property 7_
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 8.8_

- [ ] 15. Cơ chế Write_Freeze
  - [ ] 15.1 `libs/interceptors/src/lib/maintenance.interceptor.ts`: đọc `MAINTENANCE_MODE` (`off` | `read-only`). Ở `read-only` chặn gRPC method khớp tiền tố ghi (`Create`, `Update`, `Delete`, `Adjust`, `Upsert`, `Cancel`, `Approve`, `Settle`, `Increase`, `Decrease`) và HTTP method khác `GET` / `HEAD`. Trả gRPC `FAILED_PRECONDITION` hoặc HTTP `503` với mã `MAINTENANCE`. Không chặn health-check và readiness probe.
  - [ ] 15.2 Đăng ký interceptor ở cả chín service.
  - [ ] 15.3 Test liệt kê toàn bộ gRPC method của chín service, khẳng định mỗi method ghi bị chặn và không probe nào bị chặn. Test này là phòng tuyến chống việc thêm tiền tố mới mà quên cập nhật danh sách.
    - _Supports: Property 14_
  - [ ] 15.4 Thêm `MAINTENANCE_MODE` vào `.env.example` với giá trị mặc định `off`.
  - _Requirements: 8.3, 8.4_

- [ ] 16. Cập nhật CI
  - [ ] 16.1 Thêm job `check-schema` vào `.github/workflows/push.yml`, chạy trước job `docker`: khởi động service container `mysql:8.0` với `sql_mode=STRICT_ALL_TABLES` và `transaction_isolation=READ-COMMITTED`; với từng service bị ảnh hưởng chạy `migrate-deploy` lên database rỗng rồi `prisma migrate diff --from-schema-datasource --to-schema-datamodel --exit-code`; chạy `check-destructive.ts`; chạy `prisma validate`.
  - [ ] 16.2 Thêm bước chạy `pnpm nx run-many -t test` vào pipeline.
  - [ ] 16.3 Nâng `KEEP` trong bước prune ECR, hoặc thêm tag bảo vệ cho image trước cutover. Giá trị `KEEP: 1` hiện tại sẽ xóa image rollback ngay lần deploy kế tiếp, xung đột trực tiếp với kế hoạch rollback.
  - [ ] 16.4 Ghi hợp đồng cho Kubernetes Job chạy `migrate-deploy`: phải hoàn tất thành công trước khi `kubectl rollout restart` được gọi, phải thất bại lớn tiếng, phải dùng cùng secret với deployment. Manifest nằm ngoài repository nên task này chỉ tạo tài liệu và điểm móc trong pipeline.
  - _Requirements: 4.2, 4.5, 8.7_

- [ ] 17. Tài liệu
  - [ ] 17.1 Cập nhật `README.md`: thay mô tả Neon PostgreSQL bằng MySQL cho chín Service_Database.
  - [ ] 17.2 `docs/runbook-mysql-migration.md`: backup, precheck, migrate, copy, validate, cutover, rollback, kèm lệnh cụ thể và cổng chặn từng bước. Bao gồm kết quả quét lịch sử git ở bước 7.5.
  - [ ] 17.3 `docs/type-mapping-matrix.md`: trích từ mục Data Models của design thành tài liệu tra cứu độc lập, phủ scalar list, JSON, UUID, enum, DateTime, Float, Text, autoincrement.
  - [ ] 17.4 `docs/affected-files.md`: trích từ mục Danh sách file bị ảnh hưởng.
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 18. Diễn tập đầy đủ trong Acceptance_Environment
  - [ ] 18.1 Xác nhận backup khôi phục được tồn tại cho chín Source_Database.
  - [ ] 18.2 Khôi phục chín backup vào Acceptance_Environment và xác nhận số bản ghi khớp Baseline_Manifest.
  - [ ] 18.3 Chạy `migrate-deploy`, `copy`, `fix-sequence`, `validate` trên toàn bộ chín service. Yêu cầu `overall: pass`.
  - [ ] 18.4 Chạy mười Critical_Flow của requirement 9.1 đến 9.10.
  - [ ] 18.5 Chạy hai script `scripts/seeder_parent_category.js` và `scripts/seeder_category.js` qua API, xác nhận tên danh mục tiếng Việt và quan hệ parent-child đúng. Hai script này gọi API nên không cần sửa.
  - [ ] 18.6 Diễn tập `reverse-copy` và rollback.
  - [ ] 18.7 Đo thời lượng Write_Freeze. Dùng số đo này làm ngưỡng trong Approved_Cutover_Plan.
  - [ ] 18.8 Quan sát `SHOW PROCESSLIST` để xác nhận connection pool của `@prisma/adapter-mariadb` giải phóng connection đúng `idleTimeout`. Có báo cáo công khai về việc tham số này bị bỏ qua trong một số bản Prisma 7; đây là điểm kiểm chứng trên hạ tầng thật.
  - [ ] 18.9 Xuất `reports/baseline-manifest-*.json` với số bản ghi thực tế từng model và trình phê duyệt trước khi chốt kế hoạch Cutover.
  - **Cổng chặn: mọi bước phải pass trước khi lên kế hoạch Cutover production.**
  - _Requirements: 8.1, 8.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 11.5_

- [ ] 19. Cutover production
  - Thực hiện theo bảng trình tự 15 bước tại mục "Cutover, backup và rollback" của design, tôn trọng từng cổng chặn.
  - Provision chín MySQL database với `transaction_isolation = READ-COMMITTED`, `sql_mode` gồm `STRICT_ALL_TABLES`, charset `utf8mb4`, collation mặc định `utf8mb4_0900_as_cs`.
  - Cấp chín database URL qua Kubernetes Secret lấy từ AWS Secrets Manager. Repository chỉ chứa tên secret.
  - Copy khối dữ liệu bất biến trước khi bật Write_Freeze để giảm thời lượng freeze.
  - Ghi `cutover-log.json` với thời điểm bắt đầu, thời điểm kết thúc, thời lượng Write_Freeze, trạng thái từng bước và người phê duyệt.
  - Giữ `reverse-copy` khả dụng trong 24 giờ sau khi tắt Write_Freeze. Sau cửa sổ này, rollback trở thành quyết định nghiệp vụ về mất dữ liệu.
  - Thu hồi credential PostgreSQL khỏi workload và secret store **sau** khi hết cửa sổ rollback, không phải ngay sau cutover.
  - **Task này là thao tác vận hành có phê duyệt của con người ở từng cổng chặn. Không tự động hóa toàn phần.**
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.3, 8.5, 8.6, 8.7, 8.8, 8.9, 10.3, 10.4, 10.5, 10.6_

## Notes

**Ba quyết định đã chốt trong design mà việc triển khai không được tự đổi.**

Collation dùng hai loại, không một loại. `utf8mb4_0900_as_cs` làm mặc định, `utf8mb4_0900_as_ci` cho đúng bảy cột tìm kiếm. Không dùng `utf8mb4_0900_ai_ci` vì nó bỏ phân biệt dấu và làm `Ca phe` khớp `Cà phê`, khác hành vi `ILIKE` hiện tại. Không dùng `utf8mb4_general_ci` vì nó không tuân UCA.

Bảy trường scalar list dùng `Json`, riêng `User.group` dùng bảng nối. Sự khác biệt này có căn cứ: đã grep toàn bộ `apps/services/**/*.ts` và chỉ `User.group` bị truy vấn theo phần tử (`hasSome`). Đừng đơn giản hóa thành một phương án duy nhất cho cả tám trường.

`video.repository.feed` bỏ hoàn toàn raw SQL thay vì chỉ đổi cú pháp. Phương án `$queryRaw` với `Prisma.join` cũng an toàn về injection nhưng trả `isHidden` là `0`/`1` thay vì `boolean`, và code hiện tại khai báo `any[]` nên lỗi này sẽ không lộ ra ở tầng biên dịch.

**Hai điểm sửa nằm ngoài phạm vi migration nhưng phải làm cùng lúc.** `excludeIds` đang được nội suy trực tiếp vào chuỗi SQL trong video feed — đó là lỗ SQL injection có thật, độc lập với việc đổi database. `database.config.ts` đang `console.error` nguyên zod error, khiến database URL kèm password bị ghi ra log khi cấu hình sai. Cả hai đều được sửa trong Task 10 và Task 7.

**Ngoại lệ đã tuyên bố với requirement 2.5.** Thứ tự phần tử của `User.group` không được bảo toàn, vì bảng nối `UserGroup` không có cột `position`. Căn cứ: code hiện tại chỉ dùng `hasSome`, phép trừ tập hợp và `includes`, không có ngữ nghĩa thứ tự. Nếu phê duyệt yêu cầu bảo toàn thứ tự, thêm cột `position Int` và sắp xếp khi đọc.

**Năm giả định chưa kiểm chứng được từ repository.** Chúng ảnh hưởng kế hoạch và cần làm rõ trước hoặc trong lúc thực thi: manifest triển khai và tình trạng credential trong lịch sử git; số lượng bản ghi và độ dài giá trị thực tế; hạ tầng MySQL đích là RDS, Aurora hay self-hosted; nội dung dữ liệu JSON hiện tại có tuân zod schema hay không; ngưỡng thời lượng Write_Freeze mà nghiệp vụ chấp nhận. Task 3.9 và Task 7.5 trả lời hai giả định đầu.

**Điểm dừng bắt buộc.** Task 3 (precheck), Task 11 (checkpoint build) và Task 18 (diễn tập) là ba cổng chặn. Nếu bất kỳ cổng nào thất bại, dừng và báo cáo thay vì vá đoán.
