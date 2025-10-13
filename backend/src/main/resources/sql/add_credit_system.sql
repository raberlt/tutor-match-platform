-- Migration script để thêm hệ thống tín dụng
-- File: add_credit_system.sql

-- 1. Thêm cột credit_balance vào bảng users
ALTER TABLE users 
ADD COLUMN credit_balance DECIMAL(10,2) DEFAULT 0.00;

-- Cập nhật tất cả records hiện tại có giá trị NULL thành 0.00
UPDATE users SET credit_balance = 0.00 WHERE credit_balance IS NULL;

-- Sau đó mới set NOT NULL constraint
ALTER TABLE users 
ALTER COLUMN credit_balance DECIMAL(10,2) NOT NULL;

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
ADD COLUMN credit_transaction_id INT NULL,
    qr_code_url NVARCHAR(500) NULL,
    sepay_order_id NVARCHAR(100) NULL;

-- 4. Thêm foreign key cho credit_transaction_id
ALTER TABLE payments 
ADD CONSTRAINT FK_payments_credit_transaction 
    FOREIGN KEY (credit_transaction_id) REFERENCES credit_transactions(id);

-- 5. Tạo index để tối ưu performance
CREATE INDEX IX_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IX_credit_transactions_booking_id ON credit_transactions(booking_id);
CREATE INDEX IX_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IX_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IX_payments_sepay_order_id ON payments(sepay_order_id);

-- 6. Cập nhật dữ liệu mẫu - nạp tín dụng ban đầu cho các user hiện có
-- (Tùy chọn: có thể nạp 100,000 VND tín dụng cho mỗi user)
UPDATE users 
SET credit_balance = 100000.00 
WHERE role IN ('STUDENT', 'TUTOR');

-- 7. Tạo trigger để tự động cập nhật updated_at
CREATE TRIGGER TR_credit_transactions_updated_at
ON credit_transactions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE credit_transactions 
    SET updated_at = GETDATE()
    FROM credit_transactions ct
    INNER JOIN inserted i ON ct.id = i.id;
END;

-- 8. Thêm comment cho các bảng và cột
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Hệ thống tín dụng cho TutorMatch Platform', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'credit_transactions';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Số dư tín dụng của người dùng', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'users', 
    @level2type = N'COLUMN', @level2name = N'credit_balance';

-- 9. Tạo view để thống kê tín dụng
CREATE VIEW v_credit_statistics AS
SELECT 
    u.id as user_id,
    u.username,
    u.firstName + ' ' + u.lastName as full_name,
    u.role,
    u.credit_balance,
    ISNULL(deposits.total_deposits, 0) as total_deposits,
    ISNULL(withdrawals.total_withdrawals, 0) as total_withdrawals,
    COUNT(ct.id) as total_transactions
FROM users u
LEFT JOIN credit_transactions ct ON u.id = ct.user_id
LEFT JOIN (
    SELECT user_id, SUM(amount) as total_deposits
    FROM credit_transactions 
    WHERE transaction_type IN ('DEPOSIT', 'REFUND', 'ADMIN_ADJUSTMENT', 'BONUS', 'TRANSFER_IN')
    GROUP BY user_id
) deposits ON u.id = deposits.user_id
LEFT JOIN (
    SELECT user_id, SUM(amount) as total_withdrawals
    FROM credit_transactions 
    WHERE transaction_type IN ('PAYMENT', 'WITHDRAWAL', 'PENALTY', 'TRANSFER_OUT')
    GROUP BY user_id
) withdrawals ON u.id = withdrawals.user_id
GROUP BY u.id, u.username, u.firstName, u.lastName, u.role, u.credit_balance, 
         deposits.total_deposits, withdrawals.total_withdrawals;

-- 10. Tạo stored procedure để nạp tín dụng
CREATE PROCEDURE sp_deposit_credit
    @user_id INT,
    @amount DECIMAL(10,2),
    @description NVARCHAR(500) = NULL,
    @reference_id NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @balance_before DECIMAL(10,2);
    DECLARE @balance_after DECIMAL(10,2);
    
    -- Lấy số dư hiện tại
    SELECT @balance_before = credit_balance FROM users WHERE id = @user_id;
    
    -- Cập nhật số dư
    UPDATE users 
    SET credit_balance = credit_balance + @amount
    WHERE id = @user_id;
    
    -- Lấy số dư sau khi cập nhật
    SELECT @balance_after = credit_balance FROM users WHERE id = @user_id;
    
    -- Tạo transaction record
    INSERT INTO credit_transactions (
        user_id, transaction_type, amount, balance_before, balance_after, 
        description, reference_id
    ) VALUES (
        @user_id, 'DEPOSIT', @amount, @balance_before, @balance_after,
        @description, @reference_id
    );
    
    SELECT @balance_after as new_balance;
END;

-- 11. Tạo stored procedure để thanh toán bằng tín dụng
CREATE PROCEDURE sp_pay_with_credit
    @user_id INT,
    @amount DECIMAL(10,2),
    @description NVARCHAR(500) = NULL,
    @reference_id NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @balance_before DECIMAL(10,2);
    DECLARE @balance_after DECIMAL(10,2);
    
    -- Kiểm tra số dư
    SELECT @balance_before = credit_balance FROM users WHERE id = @user_id;
    
    IF @balance_before < @amount
    BEGIN
        RAISERROR('Insufficient credit balance', 16, 1);
        RETURN;
    END
    
    -- Cập nhật số dư
    UPDATE users 
    SET credit_balance = credit_balance - @amount
    WHERE id = @user_id;
    
    -- Lấy số dư sau khi cập nhật
    SELECT @balance_after = credit_balance FROM users WHERE id = @user_id;
    
    -- Tạo transaction record
    INSERT INTO credit_transactions (
        user_id, transaction_type, amount, balance_before, balance_after, 
        description, reference_id
    ) VALUES (
        @user_id, 'PAYMENT', @amount, @balance_before, @balance_after,
        @description, @reference_id
    );
    
    SELECT @balance_after as new_balance;
END;
