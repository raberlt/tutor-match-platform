package fsa.training.tutormatch.enums;

public enum SessionStatus {
    PAYMENT_PENDING("Chờ thanh toán"),
    PAYMENT_COMPLETED("Đã thanh toán"),
    UPCOMING("Sắp diễn ra"),
    IN_PROGRESS("Đang diễn ra"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy"),
    REFUNDED("Đã hoàn tiền"),
    RESCHEDULED("Đã đổi lịch");
    
    private final String displayName;
    
    SessionStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
