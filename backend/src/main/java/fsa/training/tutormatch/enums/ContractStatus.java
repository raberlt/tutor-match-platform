package fsa.training.tutormatch.enums;

public enum ContractStatus {
    PENDING("Chờ duyệt"),
    APPROVED("Đã duyệt"),
    ACTIVE("Đang hoạt động"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy"),
    EXPIRED("Hết hạn");
    
    private final String displayName;
    
    ContractStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
