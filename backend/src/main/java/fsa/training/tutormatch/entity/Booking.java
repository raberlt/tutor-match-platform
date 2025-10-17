package fsa.training.tutormatch.entity;

import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.BookingType;
import fsa.training.tutormatch.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.List;

@Entity
@Data
@Table(name = "bookings")
@EqualsAndHashCode(exclude = {"student", "tutor", "sessions"})
@ToString(exclude = {"student", "tutor", "sessions"})
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Mã booking duy nhất (BK-2024-001, BK-2024-002, ...)
    @Column(name = "booking_code", unique = true, nullable = false, columnDefinition = "NVARCHAR(20)")
    private String bookingCode;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private TutorProfile tutor;

    // subject được đưa xuống từng Session; giữ tương thích nếu cần bằng cách xoá trường này


    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @Enumerated(EnumType.STRING)
    private BookingType bookingType;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String note;

    // Financial fields
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount; // Tổng học phí gốc (trước giảm giá)
    
    @Column(name = "final_amount", precision = 10, scale = 2)
    private BigDecimal finalAmount; // Học phí cuối cùng (sau giảm giá)
    
    @Column(name = "coupon_code", columnDefinition = "NVARCHAR(50)")
    private String couponCode; // Mã giảm giá đã áp dụng
    
    // discount_amount removed per new requirement; use finalAmount & couponCode instead
    
    // Package specific fields
    @Column(name = "total_sessions")
    private Integer totalSessions;

    // Người huỷ booking
    @Enumerated(EnumType.STRING)
    @Column(name = "cancelled_by")
    private CancelledBy cancelledBy;

    @Column(name = "cancel_reason", columnDefinition = "NVARCHAR(500)")
    private String cancelReason;

    // Deadline thanh toán (single: +10m; package sau accept: +24h)
    @Column(name = "payment_deadline")
    private ZonedDateTime paymentDeadline;
    
    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = null; // Mặc định null, chỉ set khi cần thiết
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(name = "payment_date")
    private ZonedDateTime paymentDate;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
    
    // One-to-Many relationship with sessions
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Session> sessions;
    
    // Helper method for backward compatibility
    public Double getAmount() {
        return this.totalAmount != null ? this.totalAmount.doubleValue() : null;
    }
    
    public void setAmount(Double amount) {
        this.totalAmount = amount != null ? BigDecimal.valueOf(amount) : null;
    }

    @PrePersist
    public void setDefaultStatusOnCreate() {
        if (this.status == null) {
            if (this.bookingType == BookingType.PACKAGE) {
                this.status = BookingStatus.AWAITING_TUTOR_ACCEPT;
            } else {
                this.status = BookingStatus.PAYMENT_PENDING;
            }
        }
        
        // Tự động tạo booking code nếu chưa có
        if (this.bookingCode == null || this.bookingCode.isEmpty()) {
            this.bookingCode = generateBookingCode();
        }
        
        // Nếu chưa có finalAmount, mặc định bằng totalAmount
        if (this.finalAmount == null) {
            this.finalAmount = this.totalAmount;
        }
    }
    
    // Helper method để tạo booking code
    private String generateBookingCode() {
        String year = String.valueOf(java.time.LocalDate.now().getYear());
        String month = String.format("%02d", java.time.LocalDate.now().getMonthValue());
        String day = String.format("%02d", java.time.LocalDate.now().getDayOfMonth());
        String time = String.format("%02d%02d", 
            java.time.LocalTime.now().getHour(), 
            java.time.LocalTime.now().getMinute());
        return String.format("BK-%s%s%s-%s", year.substring(2), month, day, time);
    }
    
    // Helper methods for timezone handling
    public ZonedDateTime getCreatedAtInTimezone(String timezoneId) {
        return createdAt != null ? createdAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    public ZonedDateTime getUpdatedAtInTimezone(String timezoneId) {
        return updatedAt != null ? updatedAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    public ZonedDateTime getPaymentDateInTimezone(String timezoneId) {
        return paymentDate != null ? paymentDate.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
}