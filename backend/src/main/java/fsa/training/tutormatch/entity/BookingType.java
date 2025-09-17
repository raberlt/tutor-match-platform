package fsa.training.tutormatch.entity;

public enum BookingType {
    TRIAL("Học thử"),
    SINGLE_SESSION("Học buổi đơn"), 
    PACKAGE("Học theo gói");
    
    private final String displayName;
    
    BookingType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
