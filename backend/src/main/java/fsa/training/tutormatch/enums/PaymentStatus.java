package fsa.training.tutormatch.enums;

public enum PaymentStatus {
    PENDING("Chờ thanh toán"),
    COMPLETED("Đã thanh toán"),
    FAILED("Thanh toán thất bại"),
    REFUNDED("Đã hoàn tiền"),
    PROCESSING("Đang xử lý"),
    CANCELLED("Hủy");
    
    private final String displayName;
    
    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
