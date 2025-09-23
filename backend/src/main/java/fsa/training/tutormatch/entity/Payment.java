package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.ZoneId;

@Entity
@Data
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal originalAmount; // Giá gốc trước khi giảm

    @Column(precision = 10, scale = 2)
    private BigDecimal discountAmount; // Số tiền được giảm

    @ManyToOne
    @JoinColumn(name = "coupon_id")
    private Coupon coupon; // Mã giảm giá đã sử dụng

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String transactionId; // ID giao dịch từ payment gateway

    @Column(columnDefinition = "NVARCHAR(255)")
    private String paymentGateway; // VNPay, MoMo, Banking, etc.

    @Column(columnDefinition = "NVARCHAR(500)")
    private String description;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String gatewayResponse; // Response từ payment gateway

    private ZonedDateTime paidAt;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
    
    // Helper methods for timezone handling
    public ZonedDateTime getCreatedAtInTimezone(String timezoneId) {
        return createdAt != null ? createdAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    public ZonedDateTime getUpdatedAtInTimezone(String timezoneId) {
        return updatedAt != null ? updatedAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    public ZonedDateTime getPaidAtInTimezone(String timezoneId) {
        return paidAt != null ? paidAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
}