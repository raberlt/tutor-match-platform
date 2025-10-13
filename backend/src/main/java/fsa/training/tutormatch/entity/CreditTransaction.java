package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import fsa.training.tutormatch.enums.CreditTransactionType;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.ZoneId;

@Data
@Entity
@Table(name = "credit_transactions")
@EqualsAndHashCode(exclude = {"user", "booking"})
@ToString(exclude = {"user", "booking"})
public class CreditTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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
    private CreditTransactionType transactionType;

    @NotNull(message = "Amount is required")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Balance before is required")
    @Column(name = "balance_before", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceBefore;

    @NotNull(message = "Balance after is required")
    @Column(name = "balance_after", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "description", columnDefinition = "NVARCHAR(500)")
    private String description;

    @Column(name = "reference_id", columnDefinition = "NVARCHAR(100)")
    private String referenceId; // ID tham chiếu từ booking, payment, etc.

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    // Helper methods for JSON serialization
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

    // Helper methods using user's timezone
    public ZonedDateTime getCreatedAtInUserTimezone() {
        return user != null ? getCreatedAtInTimezone(user.getTimezone()) : null;
    }

    public ZonedDateTime getUpdatedAtInUserTimezone() {
        return user != null ? getUpdatedAtInTimezone(user.getTimezone()) : null;
    }
}

