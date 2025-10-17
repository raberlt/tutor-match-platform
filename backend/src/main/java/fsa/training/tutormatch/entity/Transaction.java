package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import fsa.training.tutormatch.enums.TransactionType;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.TransactionStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.ZoneId;

@Data
@Entity
@Table(name = "transactions")
@EqualsAndHashCode(exclude = {"payment", "user", "booking"})
@ToString(exclude = {"payment", "user", "booking"})
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    @JsonIgnore
    private Payment payment;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    private Booking booking;

    @NotNull(message = "Transaction type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType type;

    @NotNull(message = "Payment method is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod method;

    @NotNull(message = "Transaction status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;

    @NotNull(message = "Amount is required")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance_before", precision = 10, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", precision = 10, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "description", columnDefinition = "NVARCHAR(500)")
    private String description;

    @Column(name = "transaction_ref", columnDefinition = "NVARCHAR(100)")
    private String transactionRef;

    @Column(name = "gateway_transaction_id", columnDefinition = "NVARCHAR(255)")
    private String gatewayTransactionId;

    @Column(name = "processed_at")
    private ZonedDateTime processedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    // Helper methods for JSON serialization
    public Integer getPaymentId() {
        return payment != null ? payment.getId() : null;
    }

    public Integer getUserId() {
        return user != null ? user.getId() : null;
    }

    public String getUserName() {
        return user != null ? user.getFullName() : null;
    }

    public Integer getBookingId() {
        return booking != null ? booking.getId() : null;
    }

    // Helper methods for timezone handling
    public ZonedDateTime getCreatedAtInTimezone(String timezoneId) {
        return createdAt != null ? createdAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }

    public ZonedDateTime getUpdatedAtInTimezone(String timezoneId) {
        return updatedAt != null ? updatedAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }

    public ZonedDateTime getProcessedAtInTimezone(String timezoneId) {
        return processedAt != null ? processedAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }

    // Helper methods using user's timezone
    public ZonedDateTime getCreatedAtInUserTimezone() {
        return user != null ? getCreatedAtInTimezone(user.getTimezone()) : null;
    }

    public ZonedDateTime getUpdatedAtInUserTimezone() {
        return user != null ? getUpdatedAtInTimezone(user.getTimezone()) : null;
    }

    public ZonedDateTime getProcessedAtInUserTimezone() {
        return user != null ? getProcessedAtInTimezone(user.getTimezone()) : null;
    }
    
    // Helper method để tạo transaction reference ngắn gọn và duy nhất
    public static String generateTransactionRef() {
        java.time.LocalDate nowDate = java.time.LocalDate.now();
        java.time.LocalTime nowTime = java.time.LocalTime.now();
        String y = String.valueOf(nowDate.getYear()).substring(2);     // YY
        String m = String.format("%02d", nowDate.getMonthValue());     // MM
        String d = String.format("%02d", nowDate.getDayOfMonth());     // DD
        String hh = String.format("%02d", nowTime.getHour());          // HH
        String mm = String.format("%02d", nowTime.getMinute());        // MM
        String ss = String.format("%02d", nowTime.getSecond());        // SS
        // hậu tố ngẫu nhiên 2 ký tự [A-Z0-9]
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.util.Random rnd = new java.util.Random();
        String suffix = "" + chars.charAt(rnd.nextInt(chars.length())) + chars.charAt(rnd.nextInt(chars.length()));
        // Định dạng: TX + YYMMDD + HHMMSS + 2 ký tự = 2+6+6+2 = 16 ký tự (phù hợp NVARCHAR(100))
        return "TX" + y + m + d + hh + mm + ss + suffix;
    }
}

