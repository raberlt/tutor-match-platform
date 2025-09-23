package fsa.training.tutormatch.enums;

public enum BookingStatus {
    PENDING("Chờ xử lý"),
    PAYMENT_PENDING("Chờ thanh toán"),
    PAYMENT_COMPLETED("Đã thanh toán"),
    TUTOR_APPROVED("Giảng viên đã chấp nhận"),
    TUTOR_REJECTED("Giảng viên đã từ chối"),
    CONFIRMED("Đã xác nhận"),
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


//student -> single ->chờ thanh toán -> thanh toán -> confirmed -> in progress -> COMPLETED or CANCELLED -> REFUNDED