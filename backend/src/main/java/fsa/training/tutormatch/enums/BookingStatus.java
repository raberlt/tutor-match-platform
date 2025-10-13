package fsa.training.tutormatch.enums;

public enum BookingStatus {
    PAYMENT_PENDING("Chờ thanh toán"),
    PAYMENT_COMPLETED("Đã thanh toán"),
    TUTOR_APPROVED("Gia sư đã chấp nhận"),
    TUTOR_REJECTED("Gia sư đã từ chối"),
    UPCOMING("Sắp diễn ra"),
    IN_PROGRESS("Đang diễn ra"),
    COMPLETED("Hoàn thành"),
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

//student -> single -> chờ thanh toán -> đã thanh toán -> gia sư chấp nhận -> sắp diễn ra (48h trước) -> đang diễn ra -> hoàn thành hoặc đã hủy -> đã hoàn tiền
