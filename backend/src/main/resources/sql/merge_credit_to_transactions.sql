-- Migration script để gộp credit_transactions vào transactions
-- File: merge_credit_to_transactions.sql

-- 1. Thêm các cột cần thiết vào bảng transactions
ALTER TABLE transactions 
ADD COLUMN balance_before DECIMAL(10,2) NULL,
ADD COLUMN balance_after DECIMAL(10,2) NULL;

-- 2. Đổi tên cột reference_id thành transaction_ref
EXEC sp_rename 'transactions.reference_id', 'transaction_ref', 'COLUMN';

-- 3. Đổi tên cột transaction_id thành gateway_transaction_id  
EXEC sp_rename 'transactions.transaction_id', 'gateway_transaction_id', 'COLUMN';

-- 4. Migrate dữ liệu từ credit_transactions sang transactions
INSERT INTO transactions (
    user_id, 
    booking_id, 
    transaction_type, 
    payment_method, 
    status, 
    amount, 
    balance_before, 
    balance_after, 
    description, 
    transaction_ref, 
    gateway_transaction_id, 
    created_at, 
    updated_at
)
SELECT 
    ct.user_id,
    ct.booking_id,
    CASE 
        WHEN ct.transaction_type = 'DEPOSIT' THEN 'DEPOSIT'
        WHEN ct.transaction_type = 'WITHDRAWAL' THEN 'WITHDRAWAL'
        WHEN ct.transaction_type = 'PAYMENT' THEN 'PAYMENT'
        WHEN ct.transaction_type = 'REFUND' THEN 'REFUND'
        WHEN ct.transaction_type = 'ADMIN_ADJUSTMENT' THEN 'ADMIN_ADJUSTMENT'
        WHEN ct.transaction_type = 'BONUS' THEN 'BONUS'
        WHEN ct.transaction_type = 'PENALTY' THEN 'PENALTY'
        WHEN ct.transaction_type = 'TRANSFER_IN' THEN 'TRANSFER_IN'
        WHEN ct.transaction_type = 'TRANSFER_OUT' THEN 'TRANSFER_OUT'
        ELSE 'DEPOSIT'
    END as transaction_type,
    'CREDIT' as payment_method,  -- Mặc định cho credit transactions
    'COMPLETED' as status,        -- Mặc định completed cho credit transactions
    ct.amount,
    ct.balance_before,
    ct.balance_after,
    ct.description,
    ct.reference_id as transaction_ref,
    'CREDIT_' + CAST(ct.id AS VARCHAR) as gateway_transaction_id,
    ct.created_at,
    ct.updated_at
FROM credit_transactions ct;

-- 5. Xóa bảng credit_transactions
DROP TABLE credit_transactions;

-- 6. Cập nhật foreign key constraints nếu cần
-- (Các foreign key đã được tạo sẵn trong bảng transactions)

-- 7. Tạo index cho performance
CREATE INDEX IX_transactions_transaction_ref ON transactions(transaction_ref);
CREATE INDEX IX_transactions_gateway_transaction_id ON transactions(gateway_transaction_id);
CREATE INDEX IX_transactions_balance_before ON transactions(balance_before);
CREATE INDEX IX_transactions_balance_after ON transactions(balance_after);

PRINT 'Credit transactions merged to transactions table successfully!';

