# Hướng Dẫn Chạy Migration Database

## 🚨 Lỗi Hiện Tại

```
Invalid column name 'credit_balance'
```

## 🔧 Giải Pháp

### Bước 1: Kết nối SQL Server

1. Mở SQL Server Management Studio (SSMS)
2. Kết nối đến database của dự án

### Bước 2: Chạy Migration Script

Chạy script sau trong SQL Server:

```sql
-- 1. Thêm cột credit_balance vào bảng users
ALTER TABLE users
ADD credit_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- 2. Tạo bảng credit_transactions
CREATE TABLE credit_transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NULL,
    transaction_type NVARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description NVARCHAR(500) NULL,
    reference_id NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_credit_transactions_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_credit_transactions_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- 3. Thêm các cột mới vào bảng payments
ALTER TABLE payments
ADD credit_transaction_id INT NULL,
    qr_code_url NVARCHAR(500) NULL,
    sepay_order_id NVARCHAR(100) NULL;

-- 4. Thêm foreign key cho credit_transaction_id
ALTER TABLE payments
ADD CONSTRAINT FK_payments_credit_transaction
    FOREIGN KEY (credit_transaction_id) REFERENCES credit_transactions(id);

-- 5. Cập nhật dữ liệu mẫu - nạp tín dụng ban đầu cho các user hiện có
UPDATE users
SET credit_balance = 100000.00
WHERE role IN ('STUDENT', 'TUTOR');

-- 6. Tạo index để tối ưu performance
CREATE INDEX IX_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IX_credit_transactions_booking_id ON credit_transactions(booking_id);
CREATE INDEX IX_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IX_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IX_payments_sepay_order_id ON payments(sepay_order_id);
```

### Bước 3: Kiểm tra Migration

Sau khi chạy script, kiểm tra:

```sql
-- Kiểm tra cột credit_balance đã được thêm
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'credit_balance';

-- Kiểm tra bảng credit_transactions đã được tạo
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'credit_transactions';

-- Kiểm tra dữ liệu user với credit_balance
SELECT id, username, firstName, lastName, role, credit_balance
FROM users
WHERE role IN ('STUDENT', 'TUTOR');
```

### Bước 4: Restart Backend

Sau khi migration thành công:

1. Dừng backend (Ctrl+C)
2. Chạy lại: `mvn spring-boot:run`

## 📁 File Migration

- **Full script**: `backend/src/main/resources/sql/add_credit_system.sql`
- **Simple script**: `backend/src/main/resources/sql/simple_credit_migration.sql`

## ⚠️ Lưu Ý

- Backup database trước khi chạy migration
- Đảm bảo không có user nào đang sử dụng hệ thống
- Kiểm tra kết nối database trong `application.properties`

## 🔍 Troubleshooting

Nếu gặp lỗi:

1. Kiểm tra quyền user database
2. Đảm bảo các bảng `users`, `bookings`, `payments` đã tồn tại
3. Kiểm tra foreign key constraints
4. Xem log SQL Server để biết lỗi chi tiết

