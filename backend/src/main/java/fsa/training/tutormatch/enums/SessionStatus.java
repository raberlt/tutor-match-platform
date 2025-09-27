package fsa.training.tutormatch.enums;

public enum SessionStatus {
    SCHEDULED("Đã lên lịch"),
    IN_PROGRESS("Đang diễn ra"),
    COMPLETED("Đã hoàn thành"),
    CANCELLED("Đã hủy"),
    NO_SHOW("Vắng mặt");
    
    private final String displayName;
    
    SessionStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
