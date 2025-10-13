package fsa.training.tutormatch.enums;

public enum TransactionStatus {
    PENDING("Chờ xử lý"),
    COMPLETED("Hoàn thành"),
    FAILED("Thất bại"),
    CANCELLED("Hủy"),
    PROCESSING("Đang xử lý");
    
    private final String displayName;
    
    TransactionStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    // Helper methods để kiểm tra trạng thái
    public boolean isPending() {
        return this == PENDING;
    }
    
    public boolean isCompleted() {
        return this == COMPLETED;
    }
    
    public boolean isFailed() {
        return this == FAILED;
    }
    
    public boolean isCancelled() {
        return this == CANCELLED;
    }
    
    public boolean isProcessing() {
        return this == PROCESSING;
    }
    
    public boolean isFinal() {
        return this == COMPLETED || this == FAILED || this == CANCELLED;
    }
}

