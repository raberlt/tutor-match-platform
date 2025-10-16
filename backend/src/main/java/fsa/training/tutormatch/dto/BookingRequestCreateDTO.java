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
    // Hỗ trợ fromTime/toTime từ frontend
    private String fromTime; // HH:mm
    private String toTime;   // HH:mm
    
    @NotNull
    private String bookingType; // SINGLE, PACKAGE
    
    private String note;
    
    // Package specific fields
    private Integer totalSessions;    // Tổng số buổi học
    
    // Financial fields
    private BigDecimal totalAmount;   // Tổng tiền
    
    // Payment fields
    private String paymentMethod;      // CREDIT, SEPAY_QR
    private Integer couponId;         // Mã giảm giá

} 