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

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.ZoneId;

@Entity
@Data
@Table(name = "bookings")
@EqualsAndHashCode(exclude = {"student", "tutor"})
@ToString(exclude = {"student", "tutor"})
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private TutorProfile tutor;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    private LocalDate date;
    private LocalTime fromTime;
    private LocalTime toTime;
    
    @Column(columnDefinition = "NVARCHAR(100)")
    private String time;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private BookingType bookingType;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String note;

    @Column(name = "amount", nullable = false)
    private Double amount;
    
    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(name = "payment_date")
    private ZonedDateTime paymentDate;

    // @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private Contract contract;
    
    @Column(name = "contract_duration")
    private Integer contractDuration;
    
    @Column(name = "sessions_per_week")
    private Integer sessionsPerWeek;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String adminNote; // Ghi chú của admin

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
    
    // Helper method for backward compatibility
    public Double getTotalAmount() {
        return this.amount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.amount = totalAmount;
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