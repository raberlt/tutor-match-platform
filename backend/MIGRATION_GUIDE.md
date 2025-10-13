# Transaction System Migration Guide

## 🎯 Overview

This migration implements a unified transaction system that replaces the separate `CreditTransaction` entity with a single `Transaction` entity that handles all financial transactions (credit, external payments, refunds, etc.).

## 🏗️ New Architecture

### Before (Old Design):

```
Booking (1) ←→ (N) Payment
Payment (1) ←→ (1) CreditTransaction (via creditTransactionId)
User (1) ←→ (N) CreditTransaction
```

### After (New Design):

```
Booking (1) ←→ (1) Payment (1) ←→ (N) Transaction
User (1) ←→ (N) Transaction
```

## 📋 Migration Steps

### 1. Deploy New Code

- Deploy the new `Transaction` entity and related services
- The new code is backward compatible and will work alongside existing `CreditTransaction`

### 2. Run Database Migration

Execute the SQL script: `backend/migration_transaction.sql`

```sql
-- This script will:
-- 1. Create the transactions table
-- 2. Create necessary indexes
-- 3. Migrate data from credit_transactions to transactions
-- 4. Create transaction records for existing payments
-- 5. Add new gateway fields to payments table
```

### 3. Verify Migration

After running the migration, verify the data:

```sql
-- Check migrated credit transactions
SELECT COUNT(*) FROM transactions WHERE payment_method = 'CREDIT';

-- Check payment transactions
SELECT COUNT(*) FROM transactions WHERE payment_method != 'CREDIT';

-- Check total transactions
SELECT COUNT(*) FROM transactions;
```

### 4. Test New Functionality

- Test credit deposits/withdrawals
- Test payment processing (VNPay, SePay, etc.)
- Test refund functionality
- Verify transaction audit trail

### 5. Remove Legacy Code (Optional)

After successful migration and testing:

- Remove `CreditTransaction` entity
- Remove `CreditTransactionRepository`
- Update any remaining references to use `Transaction`

## 🔧 New Features

### Unified Transaction Tracking

- All financial activities in one table
- Complete audit trail for all payment methods
- Easy reporting and analytics

### Enhanced Payment Support

- SePay integration with QR codes
- VNPay transaction tracking
- MoMo payment support
- Credit system integration

### Improved API

- `/api/transactions` - Complete transaction management
- Transaction statistics and reporting
- Real-time transaction status updates

## 📊 Transaction Types

| Type               | Description         | Payment Method                        |
| ------------------ | ------------------- | ------------------------------------- |
| `PAYMENT`          | Payment for booking | `CREDIT`, `VNPAY`, `MOMO`, `SEPAY_QR` |
| `REFUND`           | Refund for booking  | Same as original payment              |
| `DEPOSIT`          | Credit deposit      | `CREDIT`                              |
| `WITHDRAWAL`       | Credit withdrawal   | `CREDIT`                              |
| `ADMIN_ADJUSTMENT` | Admin adjustment    | `CREDIT`                              |
| `BONUS`            | Credit bonus        | `CREDIT`                              |
| `PENALTY`          | Credit penalty      | `CREDIT`                              |
| `TRANSFER_IN`      | Credit transfer in  | `CREDIT`                              |
| `TRANSFER_OUT`     | Credit transfer out | `CREDIT`                              |

## 🚀 Benefits

1. **Unified Tracking**: All transactions in one place
2. **Better Audit Trail**: Complete financial history
3. **Easier Reporting**: Simple queries for analytics
4. **Gateway Support**: Easy integration with payment gateways
5. **Scalability**: Easy to add new payment methods
6. **Maintainability**: Single transaction system to maintain

## ⚠️ Important Notes

- The migration preserves all existing data
- Credit transactions are migrated with `payment_method = 'CREDIT'`
- Payment transactions are created for existing payments
- The system maintains backward compatibility during transition
- Test thoroughly before removing legacy `CreditTransaction` code

## 🔍 Verification Queries

```sql
-- Verify credit transactions migrated
SELECT
    transaction_type,
    payment_method,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM transactions
WHERE payment_method = 'CREDIT'
GROUP BY transaction_type, payment_method;

-- Verify payment transactions created
SELECT
    transaction_type,
    payment_method,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM transactions
WHERE payment_method != 'CREDIT'
GROUP BY transaction_type, payment_method;

-- Check transaction status distribution
SELECT
    status,
    COUNT(*) as count
FROM transactions
GROUP BY status;
```

## 📞 Support

If you encounter any issues during migration:

1. Check the migration logs
2. Verify data integrity with verification queries
3. Test the new transaction functionality
4. Contact the development team if needed

