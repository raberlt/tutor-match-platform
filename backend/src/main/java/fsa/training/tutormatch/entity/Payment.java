package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.List;

@Entity
@Data
@Table(name = "payments")
@EqualsAndHashCode(exclude = {"booking", "student", "tutor", "coupon", "transactions"})
@ToString(exclude = {"booking", "student", "tutor", "coupon", "transactions"})
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    @JsonIgnore
    private User tutor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal originalAmount; // Giá gốc trước khi giảm

    @Column(precision = 10, scale = 2)
    private BigDecimal discountAmount; // Số tiền được giảm

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    @JsonIgnore
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

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String adminNote; // Ghi chú của admin

    // Gateway specific fields
    @Column(name = "qr_code_url", columnDefinition = "NVARCHAR(500)")
    private String qrCodeUrl; // URL QR code cho SePay
    
    @Column(name = "sepay_order_id", columnDefinition = "NVARCHAR(100)")
    private String sepayOrderId; // Order ID từ SePay
    
    @Column(name = "vnpay_transaction_id", columnDefinition = "NVARCHAR(255)")
    private String vnpayTransactionId; // VNPay transaction ID
    
    @Column(name = "vnpay_response_code", columnDefinition = "NVARCHAR(10)")
    private String vnpayResponseCode; // VNPay response code
    
    @Column(name = "momo_transaction_id", columnDefinition = "NVARCHAR(255)")
    private String momoTransactionId; // MoMo transaction ID
    
    @Column(name = "momo_response_code", columnDefinition = "NVARCHAR(10)")
    private String momoResponseCode; // MoMo response code
    
    // One-to-Many relationship with transactions
    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Transaction> transactions;

    private ZonedDateTime paidAt;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
    
    // Helper methods for JSON serialization
    public Integer getBookingId() {
        return booking != null ? booking.getId() : null;
    }

    public Integer getStudentId() {
        return student != null ? student.getId() : null;
    }

    public String getStudentName() {
        return student != null ? student.getFullName() : null;
    }

    public Integer getTutorId() {
        return tutor != null ? tutor.getId() : null;
    }

    public String getTutorName() {
        return tutor != null ? tutor.getFullName() : null;
    }

    public Integer getCouponId() {
        return coupon != null ? coupon.getId() : null;
    }

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