package fsa.training.tutormatch.enums;

public enum TransactionType {
    PAYMENT("Thanh toán"),              // All payment methods
    REFUND("Hoàn tiền"),               // All refund methods
    DEPOSIT("Nạp tiền"),               // Credit deposit
    WITHDRAWAL("Rút tiền"),            // Credit withdrawal
    ADMIN_ADJUSTMENT("Điều chỉnh admin"), // Admin adjustment
    BONUS("Thưởng"),                   // Bonus
    PENALTY("Phạt"),                   // Penalty
    TRANSFER_IN("Chuyển vào"),         // Transfer in
    TRANSFER_OUT("Chuyển ra");         // Transfer out
    
    private final String displayName;
    
    TransactionType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    // Helper methods để phân loại giao dịch
    public boolean isDebit() {
        return this == PAYMENT || this == WITHDRAWAL || this == PENALTY || this == TRANSFER_OUT;
    }
    
    public boolean isCredit() {
        return this == REFUND || this == DEPOSIT || this == ADMIN_ADJUSTMENT || 
               this == BONUS || this == TRANSFER_IN;
    }
    
    // Helper methods để kiểm tra loại transaction
    public boolean isPayment() {
        return this == PAYMENT;
    }
    
    public boolean isRefund() {
        return this == REFUND;
    }
    
    public boolean isDeposit() {
        return this == DEPOSIT;
    }
    
    public boolean isWithdrawal() {
        return this == WITHDRAWAL;
    }
}

