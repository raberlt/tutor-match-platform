package fsa.training.tutormatch.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentDTO {
    private Integer id;
    private Integer bookingId;
    private Integer studentId;
    private String studentName;
    private Integer tutorId;
    private String tutorName;
    private BigDecimal amount;
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private String couponCode;
    private String paymentMethod;
    private String status;
    private String transactionId;
    private String paymentGateway;
    private String description;
    private String paidAt;
    private String createdAt;
} 