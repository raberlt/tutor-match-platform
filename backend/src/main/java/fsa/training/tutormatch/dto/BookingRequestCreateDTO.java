package fsa.training.tutormatch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

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
    private String bookingType; // TRIAL, MONTHLY, CONTRACT_3, CONTRACT_6
    
    private String note;
    
    // Cho contract
    private Integer contractDuration; // 3 hoặc 6 tháng
    private Integer sessionsPerWeek;  // Số buổi/tuần
    private Double totalAmount;       // Tổng tiền
} 