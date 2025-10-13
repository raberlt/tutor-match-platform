    -- Migration script to create Transaction table and migrate data from CreditTransaction
-- Run this script after deploying the new Transaction entity

-- 1. Create transactions table
CREATE TABLE transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    payment_id INT NULL,
    user_id INT NOT NULL,
    booking_id INT NULL,
    transaction_type NVARCHAR(50) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NULL,
    balance_after DECIMAL(10,2) NULL,
    description NVARCHAR(500) NULL,
    reference_id NVARCHAR(100) NULL,
    transaction_id NVARCHAR(255) NULL,
    processed_at DATETIMEOFFSET NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_transactions_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
    CONSTRAINT FK_transactions_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- 2. Create indexes for better performance
CREATE INDEX IX_transactions_user_id ON transactions(user_id);
CREATE INDEX IX_transactions_booking_id ON transactions(booking_id);
CREATE INDEX IX_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IX_transactions_type ON transactions(transaction_type);
CREATE INDEX IX_transactions_method ON transactions(payment_method);
CREATE INDEX IX_transactions_status ON transactions(status);
CREATE INDEX IX_transactions_created_at ON transactions(created_at);
CREATE INDEX IX_transactions_reference_id ON transactions(reference_id);
CREATE INDEX IX_transactions_transaction_id ON transactions(transaction_id);

-- 3. Migrate data from credit_transactions to transactions
INSERT INTO transactions (
    payment_id,
    user_id,
    booking_id,
    transaction_type,
    payment_method,
    status,
    amount,
    balance_before,
    balance_after,
    description,
    reference_id,
    transaction_id,
    processed_at,
    created_at,
    updated_at
)
SELECT 
    NULL as payment_id,  -- Credit transactions don't have payment
    user_id,
    booking_id,
    CASE 
        WHEN transaction_type = 'DEPOSIT' THEN 'DEPOSIT'
        WHEN transaction_type = 'WITHDRAWAL' THEN 'WITHDRAWAL'
        WHEN transaction_type = 'PAYMENT' THEN 'PAYMENT'
        WHEN transaction_type = 'REFUND' THEN 'REFUND'
        WHEN transaction_type = 'ADMIN_ADJUSTMENT' THEN 'ADMIN_ADJUSTMENT'
        WHEN transaction_type = 'BONUS' THEN 'BONUS'
        WHEN transaction_type = 'PENALTY' THEN 'PENALTY'
        WHEN transaction_type = 'TRANSFER_IN' THEN 'TRANSFER_IN'
        WHEN transaction_type = 'TRANSFER_OUT' THEN 'TRANSFER_OUT'
        ELSE 'DEPOSIT'
    END as transaction_type,
    'CREDIT' as payment_method,  -- All credit transactions use CREDIT method
    'COMPLETED' as status,  -- Assume all existing transactions are completed
    amount,
    balance_before,
    balance_after,
    description,
    reference_id,
    CAST(id AS NVARCHAR(255)) as transaction_id,  -- Use credit transaction ID as transaction ID
    created_at as processed_at,  -- Use created_at as processed_at for completed transactions
    created_at,
    updated_at
FROM credit_transactions;

-- 4. Update payments table to add new gateway fields (if not already added)
-- These columns should already exist from the entity update, but adding for safety
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'vnpay_transaction_id')
BEGIN
    ALTER TABLE payments ADD vnpay_transaction_id NVARCHAR(255) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'vnpay_response_code')
BEGIN
    ALTER TABLE payments ADD vnpay_response_code NVARCHAR(10) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'momo_transaction_id')
BEGIN
    ALTER TABLE payments ADD momo_transaction_id NVARCHAR(255) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'momo_response_code')
BEGIN
    ALTER TABLE payments ADD momo_response_code NVARCHAR(10) NULL;
END

-- 5. Create transaction records for existing payments
-- This creates transaction records for payments that don't have corresponding credit transactions
INSERT INTO transactions (
    payment_id,
    user_id,
    booking_id,
    transaction_type,
    payment_method,
    status,
    amount,
    balance_before,
    balance_after,
    description,
    reference_id,
    transaction_id,
    processed_at,
    created_at,
    updated_at
)
SELECT 
    p.id as payment_id,
    p.student_id as user_id,
    p.booking_id,
    CASE 
        WHEN p.status = 'REFUNDED' THEN 'REFUND'
        ELSE 'PAYMENT'
    END as transaction_type,
    p.payment_method,
    CASE 
        WHEN p.status = 'COMPLETED' THEN 'COMPLETED'
        WHEN p.status = 'REFUNDED' THEN 'COMPLETED'
        WHEN p.status = 'FAILED' THEN 'FAILED'
        WHEN p.status = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'PENDING'
    END as status,
    CASE 
        WHEN p.status = 'REFUNDED' THEN -p.amount  -- Negative amount for refunds
        ELSE p.amount
    END as amount,
    NULL as balance_before,  -- No balance tracking for non-credit payments
    NULL as balance_after,
    'Payment for booking #' + CAST(p.booking_id AS NVARCHAR(10)) as description,
    'PAYMENT_' + CAST(p.id AS NVARCHAR(10)) as reference_id,
    p.transaction_id,
    p.paid_at as processed_at,
    p.created_at,
    p.updated_at
FROM payments p
WHERE p.id NOT IN (
    SELECT DISTINCT payment_id 
    FROM transactions 
    WHERE payment_id IS NOT NULL
);

-- 6. Verification queries
-- Check migration results
SELECT 
    'Credit Transactions Migrated' as description,
    COUNT(*) as count
FROM transactions 
WHERE payment_method = 'CREDIT';

SELECT 
    'Payment Transactions Created' as description,
    COUNT(*) as count
FROM transactions 
WHERE payment_method != 'CREDIT';

SELECT 
    'Total Transactions' as description,
    COUNT(*) as count
FROM transactions;

-- 7. Optional: Drop credit_transactions table after verification
-- Uncomment the following line after verifying the migration is successful
-- DROP TABLE credit_transactions;

