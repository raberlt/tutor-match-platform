package fsa.training.tutormatch.enums;

public enum CreditTransactionType {
    DEPOSIT("Nạp tiền"),                    // Nạp tín dụng vào tài khoản
    WITHDRAWAL("Rút tiền"),                 // Rút tín dụng từ tài khoản
    PAYMENT("Thanh toán"),                  // Sử dụng tín dụng để thanh toán
    REFUND("Hoàn tiền"),                    // Hoàn tín dụng khi hủy booking
    ADMIN_ADJUSTMENT("Điều chỉnh admin"),   // Admin điều chỉnh số dư
    BONUS("Thưởng"),                        // Thưởng tín dụng
    PENALTY("Phạt"),                        // Phạt tín dụng
    TRANSFER_IN("Chuyển vào"),              // Chuyển tín dụng vào
    TRANSFER_OUT("Chuyển ra");              // Chuyển tín dụng ra
    
    private final String displayName;
    
    CreditTransactionType(String displayName) {
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
        return this == DEPOSIT || this == REFUND || this == ADMIN_ADJUSTMENT || 
               this == BONUS || this == TRANSFER_IN;
    }
}

