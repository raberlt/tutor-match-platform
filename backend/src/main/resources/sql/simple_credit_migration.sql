-- Simple credit system migration for SQL Server
-- Run this script in SQL Server Management Studio

-- 1. Add credit_balance column with DEFAULT value
ALTER TABLE users 
ADD credit_balance DECIMAL(10,2) DEFAULT 0.00;

-- 2. Update existing records to have 0.00 balance
UPDATE users SET credit_balance = 0.00 WHERE credit_balance IS NULL;

-- 3. Make the column NOT NULL
ALTER TABLE users 
ALTER COLUMN credit_balance DECIMAL(10,2) NOT NULL;

-- 4. Create credit_transactions table
CREATE TABLE credit_transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NULL,
    transaction_type NVARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description NVARCHAR(500) NULL,
    reference_id NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- 5. Add new columns to payments table
ALTER TABLE payments 
ADD credit_transaction_id INT NULL;

ALTER TABLE payments 
ADD qr_code_url NVARCHAR(500) NULL;

ALTER TABLE payments 
ADD sepay_order_id NVARCHAR(100) NULL;

-- 6. Add foreign key constraint
ALTER TABLE payments 
ADD CONSTRAINT fk_payment_credit_transaction 
FOREIGN KEY (credit_transaction_id) REFERENCES credit_transactions(id);

-- 7. Create indexes for better performance
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

PRINT 'Credit system migration completed successfully!';