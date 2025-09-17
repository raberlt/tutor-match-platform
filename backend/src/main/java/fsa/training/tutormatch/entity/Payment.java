package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.sql.Timestamp;

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

    private Timestamp paidAt;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    public enum PaymentMethod {
        CREDIT_CARD,
        DEBIT_CARD,
        VNPAY,
        MOMO,
        BANKING,
        CASH
    }

    public enum PaymentStatus {
        PENDING,    // Chờ thanh toán
        PROCESSING, // Đang xử lý
        COMPLETED,  // Hoàn thành
        FAILED,     // Thất bại
        CANCELLED,  // Hủy
        REFUNDED    // Hoàn tiền
    }
} 