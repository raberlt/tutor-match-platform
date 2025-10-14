package fsa.training.tutormatch.enums;

public enum BookingStatus {
    PAYMENT_PENDING("Chờ thanh toán"),
    PAYMENT_COMPLETED("Đã thanh toán"),
    TUTOR_APPROVED("Gia sư đã chấp nhận"),
    TUTOR_REJECTED("Gia sư đã từ chối"),
    CANCELLED("Đã hủy"),
    REFUNDED("Đã hoàn tiền");
    
    private final String displayName;
    
    BookingStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

//student -> single -> chờ thanh toán -> đã thanh toán -> gia sư chấp nhận -> đã hủy -> đã hoàn tiền
