package fsa.training.tutormatch.enums;

public enum BookingType {
    SINGLE("Học đơn"), 
    PACKAGE("Học theo gói"),
    TRIAL("Học thử");
    
    private final String displayName;
    
    BookingType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    // Helper method để kiểm tra loại booking
    public boolean isSingle() {
        return this == SINGLE;
    }
    
    public boolean isPackage() {
        return this == PACKAGE;
    }
    
    public boolean isTrial() {
        return this == TRIAL;
    }
}
