package fsa.training.tutormatch.enums;

public enum BookingStatus {
    AWAITING_TUTOR_ACCEPT("Chờ gia sư chấp nhận"),
    TUTOR_ACCEPTED("Gia sư đã chấp nhận"),
    TUTOR_REJECTED("Gia sư đã từ chối"),
    PAYMENT_PENDING("Chờ thanh toán"),
    PAYMENT_EXPIRED("Quá hạn thanh toán"),
    PAYMENT_COMPLETED("Đã thanh toán"),
    CANCELLED("Đã hủy"),
    REFUNDED("Đã hoàn tiền"),
    COMPLETED("Đã hoàn thành");
    
    private final String displayName;
    
    BookingStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

//student -> single -> chờ thanh toán -> đã thanh toán -> gia sư chấp nhận -> đã hủy -> đã hoàn tiền
