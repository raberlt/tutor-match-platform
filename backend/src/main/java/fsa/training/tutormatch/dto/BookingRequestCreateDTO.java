package fsa.training.tutormatch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BookingRequestCreateDTO {
    @NotNull
    private Integer tutorId;
    
    @NotNull
    private Integer subjectId;
    
    @NotNull
    private String date; // YYYY-MM-DD
    
    @NotNull
    private String time; // HH:mm-HH:mm
    
    @NotNull
    private String bookingType; // SINGLE, PACKAGE, TRIAL
    
    private String note;
    
    // Package/Trial specific fields
    private Integer totalSessions;    // Tổng số buổi học
    private Integer sessionsPerWeek;  // Số buổi/tuần
    private Integer contractDuration; // 3 hoặc 6 tháng
    
    // Financial fields
    private BigDecimal hourlyRate;    // Phí theo giờ
    private BigDecimal sessionFee;    // Phí 1 buổi học
    private BigDecimal totalAmount;   // Tổng tiền
    
    // Payment fields
    private String paymentMethod;      // CREDIT, VNPAY, MOMO, SEPAY_QR
    private Integer couponId;         // Mã giảm giá
    
    // Schedule fields (for PACKAGE)
    private String scheduleType;      // FIXED, FLEXIBLE
    private String selectedDays;      // "MONDAY,WEDNESDAY,FRIDAY"
} 