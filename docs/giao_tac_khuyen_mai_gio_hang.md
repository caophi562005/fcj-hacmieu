# Giao Tác T-SQL: Loại 5 — Khuyến Mãi & Giỏ Hàng (Promotion & Cart Transactions)

---

### 🛒 Giao Tác 1: Thêm / Cập Nhật Sản Phẩm Vào Giỏ Hàng (Add/Upsert Cart Item)

> **Mục đích**: Khi khách hàng bấm "Thêm vào giỏ hàng", giao tác thực hiện:
>
> 1. Kiểm tra giỏ hàng của User đã có chưa. Nếu chưa có, tự động tạo mới `Cart`.
> 2. Kiểm tra SKU sản phẩm đó đã có trong giỏ chưa.
>    - Nếu **đã có**: Tăng số lượng (`quantity = quantity + @AddQuantity`).
>    - Nếu **chưa có**: Tạo mới 1 dòng trong `CartItem`.
> 3. Cập nhật lại tổng số lượng mặt hàng (`itemCount`) trong giỏ `Cart`.

```sql
-- ============================================================================
-- GIAO TÁC 1: THÊM / CẬP NHẬT SẢN PHẨM VÀO GIỎ HÀNG (T-SQL)
-- ============================================================================
CREATE PROCEDURE sp_AddOrUpdateCartItem
    @UserId VARCHAR(50),
    @ShopId VARCHAR(50),
    @ProductId VARCHAR(50),
    @SkuId VARCHAR(50),
    @ProductName NVARCHAR(255),
    @SkuValue NVARCHAR(255),
    @ProductImage NVARCHAR(500),
    @AddQuantity INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Khai báo biến cục bộ
    DECLARE @CartId VARCHAR(50);
    DECLARE @CurrentItemCount INT;

    -- BẮT ĐẦU GIAO TÁC
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Bước 1: Tìm Giỏ hàng của User, nếu chưa có thì tạo mới
        SELECT @CartId = id
        FROM Cart WITH (UPDLOCK, HOLDLOCK)
        WHERE userId = @UserId;

        IF @CartId IS NULL
        BEGIN
            SET @CartId = NEWID();
            INSERT INTO Cart (id, userId, itemCount, createdAt, updatedAt)
            VALUES (@CartId, @UserId, 0, GETDATE(), GETDATE());
        END

        -- Bước 2: Kiểm tra xem sản phẩm (CartId + ProductId + SkuId) đã có trong giỏ chưa
        IF EXISTS (
            SELECT 1 FROM CartItem WITH (UPDLOCK)
            WHERE cartId = @CartId AND productId = @ProductId AND skuId = @SkuId
        )
        BEGIN
            -- Nếu đã có -> Tăng số lượng
            UPDATE CartItem
            SET quantity = quantity + @AddQuantity,
                updatedAt = GETDATE()
            WHERE cartId = @CartId AND productId = @ProductId AND skuId = @SkuId;
        END
        ELSE
        BEGIN
            -- Nếu chưa có -> Thêm mới mặt hàng vào giỏ
            INSERT INTO CartItem (id, cartId, shopId, productId, skuId, quantity, productName, skuValue, productImage, createdAt, updatedAt)
            VALUES (NEWID(), @CartId, @ShopId, @ProductId, @SkuId, @AddQuantity, @ProductName, @SkuValue, @ProductImage, GETDATE(), GETDATE());
        END

        -- Bước 3: Đếm lại tổng số loại mặt hàng độc lập trong giỏ
        SELECT @CurrentItemCount = COUNT(*)
        FROM CartItem
        WHERE cartId = @CartId;

        -- Bước 4: Cập nhật lại itemCount trên bảng Cart
        UPDATE Cart
        SET itemCount = @CurrentItemCount,
            updatedAt = GETDATE()
        WHERE id = @CartId;

        -- XÁC NHẬN GIAO TÁC THÀNH CÔNG
        COMMIT TRANSACTION;
        PRINT N'Thêm sản phẩm vào giỏ hàng thành công!';

    END TRY
    BEGIN CATCH
        -- HỦY BỎ GIAO TÁC NẾU CÓ LỖI XẢY RA
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        -- Trả về thông tin lỗi
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO
```

---

### 🎁 GIAO TÁC 2: Áp Dụng Mã Giảm Giá Khi Đặt Hàng (Redeem Promotion Transaction)

> **Mục đích**: Khi khách hàng áp mã giảm giá vào hóa đơn đặt hàng:
>
> 1. Kiểm tra mã Promotion xem còn hiệu lực và còn số lượt sử dụng không (`usedCount < totalLimit`).
> 2. Đảm bảo mã chưa bị khách hàng sử dụng cho đơn hàng khác (`usedAt IS NULL`).
> 3. Tăng số lượt đã dùng `usedCount = usedCount + 1` của Voucher.
> 4. Tạo/Cập nhật bản ghi `Redemption` lưu vết hóa đơn `orderIds` và ghi nhận thời gian dùng `usedAt`.

```sql
-- ============================================================================
-- GIAO TÁC 2: ÁP DỤNG MÃ GIẢM GIÁ KHI ĐẶT HÀNG (T-SQL)
-- ============================================================================
CREATE PROCEDURE sp_RedeemPromotion
    @PromotionId VARCHAR(50),
    @UserId VARCHAR(50),
    @Code VARCHAR(50),
    @OrderIdsJson NVARCHAR(MAX),
    @DiscountType VARCHAR(20),
    @DiscountValue INT,
    @MinOrderSubtotal INT,
    @MaxDiscount INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalLimit INT;
    DECLARE @UsedCount INT;
    DECLARE @ExistingRedemptionId VARCHAR(50);
    DECLARE @ExistingUsedAt DATETIME2;

    -- BẮT ĐẦU GIAO TÁC
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Bước 1: Khóa dòng Promotion để kiểm tra giới hạn lượt dùng (Pessimistic Lock)
        SELECT
            @TotalLimit = totalLimit,
            @UsedCount = usedCount
        FROM Promotion WITH (UPDLOCK, HOLDLOCK)
        WHERE id = @PromotionId AND deletedAt IS NULL;

        IF @TotalLimit IS NOT NULL AND @UsedCount >= @TotalLimit
        BEGIN
            RAISERROR(N'Lỗi: Mã giảm giá đã hết lượt sử dụng (OutOfStock)!', 16, 1);
        END

        -- Bước 2: Kiểm tra xem User đã có bản ghi Redemption cho mã này chưa
        SELECT
            @ExistingRedemptionId = id,
            @ExistingUsedAt = usedAt
        FROM Redemption WITH (UPDLOCK)
        WHERE code = @Code AND userId = @UserId;

        IF @ExistingUsedAt IS NOT NULL
        BEGIN
            RAISERROR(N'Lỗi: Mã giảm giá này đã được sử dụng trước đó!', 16, 1);
        END

        -- Bước 3: Tăng số lượt đã sử dụng của Promotion lên 1
        UPDATE Promotion
        SET usedCount = usedCount + 1,
            updatedAt = GETDATE()
        WHERE id = @PromotionId;

        -- Bước 4: Tạo mới hoặc cập nhật bản ghi Redemption
        IF @ExistingRedemptionId IS NULL
        BEGIN
            INSERT INTO Redemption (
                id, promotionId, userId, orderIds, code,
                discountType, discountValue, minOrderSubtotal, maxDiscount,
                claimedAt, usedAt
            )
            VALUES (
                NEWID(), @PromotionId, @UserId, @OrderIdsJson, @Code,
                @DiscountType, @DiscountValue, @MinOrderSubtotal, @MaxDiscount,
                GETDATE(), GETDATE()
            );
        END
        ELSE
        BEGIN
            UPDATE Redemption
            SET orderIds = @OrderIdsJson,
                usedAt = GETDATE(),
                cancelledAt = NULL
            WHERE id = @ExistingRedemptionId;
        END

        -- XÁC NHẬN GIAO TÁC THÀNH CÔNG
        COMMIT TRANSACTION;
        PRINT N'Áp dụng mã giảm giá thành công!';

    END TRY
    BEGIN CATCH
        -- HỦY BỎ GIAO TÁC NẾU CÓ LỖI XẢY RA
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMessage, 16, 1);
    END CATCH
END;
GO
```

---

### 🎟️ GIAO TÁC 3: Nhận / Lưu Mã Giảm Giá Vào Ví Voucher (Claim Promotion Transaction)

> **Mục đích**: Người dùng bấm "Lưu mã" vào ví Voucher cá nhân:
>
> 1. Kiểm tra trạng thái mã (`status = 'ACTIVE'`), kiểm tra thời hạn (`startsAt <= GETDATE() <= endsAt`).
> 2. Kiểm tra tổng số mã còn lại (`usedCount < totalLimit`).
> 3. Lưu bản ghi `Redemption` gắn với `userId` ở trạng thái chưa dùng (`usedAt IS NULL`).

```sql
-- ============================================================================
-- GIAO TÁC 3: NHẬN / LƯU MÃ GIẢM GIÁ VÀO VÍ VOUCHER (T-SQL)
-- ============================================================================
CREATE PROCEDURE sp_ClaimPromotion
    @PromotionId VARCHAR(50),
    @UserId VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Code VARCHAR(50);
    DECLARE @Status VARCHAR(20);
    DECLARE @StartsAt DATETIME2;
    DECLARE @EndsAt DATETIME2;
    DECLARE @TotalLimit INT;
    DECLARE @UsedCount INT;
    DECLARE @DiscountType VARCHAR(20);
    DECLARE @DiscountValue INT;
    DECLARE @MinOrderSubtotal INT;
    DECLARE @MaxDiscount INT;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Bước 1: Đọc và khóa thông tin Promotion
        SELECT
            @Code = code,
            @Status = status,
            @StartsAt = startsAt,
            @EndsAt = endsAt,
            @TotalLimit = totalLimit,
            @UsedCount = usedCount,
            @DiscountType = discountType,
            @DiscountValue = discountValue,
            @MinOrderSubtotal = minOrderSubtotal,
            @MaxDiscount = maxDiscount
        FROM Promotion WITH (UPDLOCK, HOLDLOCK)
        WHERE id = @PromotionId AND deletedAt IS NULL;

        -- Kiểm tra các điều kiện hợp lệ
        IF @Code IS NULL
            RAISERROR(N'Không tìm thấy mã giảm giá!', 16, 1);

        IF @Status <> 'ACTIVE'
            RAISERROR(N'Mã giảm giá hiện không hoạt động!', 16, 1);

        IF @StartsAt IS NOT NULL AND @StartsAt > GETDATE()
            RAISERROR(N'Mã giảm giá chưa đến đợt mở!', 16, 1);

        IF @EndsAt IS NOT NULL AND @EndsAt < GETDATE()
            RAISERROR(N'Mã giảm giá đã hết hạn!', 16, 1);

        IF @TotalLimit IS NOT NULL AND @UsedCount >= @TotalLimit
            RAISERROR(N'Mã giảm giá đã được nhận hết!', 16, 1);

        -- Bước 2: Kiểm tra xem User đã lưu mã này chưa
        IF EXISTS (SELECT 1 FROM Redemption WHERE promotionId = @PromotionId AND userId = @UserId)
        BEGIN
            RAISERROR(N'Bạn đã lưu mã giảm giá này rồi!', 16, 1);
        END

        -- Bước 3: Lưu mã vào kho Voucher của User (Chưa sử dụng: usedAt = NULL)
        INSERT INTO Redemption (
            id, promotionId, userId, orderIds, code,
            discountType, discountValue, minOrderSubtotal, maxDiscount,
            claimedAt, usedAt
        )
        VALUES (
            NEWID(), @PromotionId, @UserId, '[]', @Code,
            @DiscountType, @DiscountValue, @MinOrderSubtotal, @MaxDiscount,
            GETDATE(), NULL
        );

        -- COMMIT GIAO TÁC
        COMMIT TRANSACTION;
        PRINT N'Lưu mã giảm giá vào ví thành công!';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO
```

---

### 🗑️ GIAO TÁC 4: Xóa Mặt Hàng Khỏi Giỏ & Đếm Lại Giỏ Hàng (Delete Cart Item Transaction)

> **Mục đích**: Khi khách hàng xóa 1 sản phẩm khỏi giỏ:
>
> 1. Xóa bản ghi trong `CartItem`.
> 2. Đếm lại số lượng mặt hàng còn lại trong giỏ `Cart`.
> 3. Cập nhật lại cột `itemCount` của `Cart`.

```sql
-- ============================================================================
-- GIAO TÁC 4: XÓA SẢN PHẨM KHỎI GIỎ HÀNG (T-SQL)
-- ============================================================================
CREATE PROCEDURE sp_DeleteCartItem
    @UserId VARCHAR(50),
    @ProductId VARCHAR(50),
    @SkuId VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CartId VARCHAR(50);
    DECLARE @NewItemCount INT;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Bước 1: Lấy CartId của User
        SELECT @CartId = id
        FROM Cart WITH (UPDLOCK)
        WHERE userId = @UserId;

        IF @CartId IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy giỏ hàng của người dùng!', 16, 1);
        END

        -- Bước 2: Xóa sản phẩm khỏi giỏ
        DELETE FROM CartItem
        WHERE cartId = @CartId AND productId = @ProductId AND skuId = @SkuId;

        -- Bước 3: Đếm lại tổng số mặt hàng còn lại trong giỏ
        SELECT @NewItemCount = COUNT(*)
        FROM CartItem
        WHERE cartId = @CartId;

        -- Bước 4: Cập nhật lại itemCount trên bảng Cart
        UPDATE Cart
        SET itemCount = @NewItemCount,
            updatedAt = GETDATE()
        WHERE id = @CartId;

        -- COMMIT GIAO TÁC
        COMMIT TRANSACTION;
        PRINT N'Xóa sản phẩm khỏi giỏ hàng thành công!';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMessage, 16, 1);
    END CATCH
END;
GO
```

---

## 3. Tóm Tắt Quy Trình Đảm Bảo Nguyên Tắc ACID Trong T-SQL

1. **`BEGIN TRANSACTION`**: Bắt đầu đánh dấu điểm khởi đầu của giao tác.
2. **`WITH (UPDLOCK, HOLDLOCK)`**: Khóa dòng dữ liệu (Pessimistic Lock) để chống hiện tượng 2 giao tác cùng đọc và sửa đồng thời (chống Concurrency / Race Condition).
3. **`BEGIN TRY ... END TRY`**: Nơi thực hiện chuỗi các câu lệnh SQL thay đổi dữ liệu (`INSERT`, `UPDATE`, `DELETE`).
4. **`COMMIT TRANSACTION`**: Khi tất cả các lệnh trong khối TRY thực thi thành công không có lỗi $\rightarrow$ Lưu vĩnh viễn thay đổi vào CSDL.
5. **`BEGIN CATCH ... END CATCH`**: Nếu có bất kỳ câu lệnh nào thất bại $\rightarrow$ Nhảy vào khối CATCH.
6. **`ROLLBACK TRANSACTION`**: Khôi phục hoàn toàn dữ liệu về trạng thái trước khi gọi `BEGIN TRANSACTION`.
