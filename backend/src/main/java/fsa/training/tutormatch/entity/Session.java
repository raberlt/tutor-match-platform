package fsa.training.tutormatch.entity;

import fsa.training.tutormatch.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "sessions")
@EqualsAndHashCode(exclude = {"booking", "changeHistory"})
@ToString(exclude = {"booking", "changeHistory"})
public class Session {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Mã session duy nhất (SS-2024-001, SS-2024-002, ...)
    @Column(name = "session_code", unique = true, nullable = false, columnDefinition = "NVARCHAR(20)")
    private String sessionCode;
    
    // Foreign Key to Booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    // Session Info
    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    
    // Subject & fee for this session
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(name = "fee", precision = 10, scale = 2)
    private BigDecimal fee;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.PAYMENT_PENDING;
    
    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
    
    @Column(name = "reschedule_count", nullable = false)
    private Integer rescheduleCount = 0;
    
    // One-to-Many relationship with session change history
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SessionChangeHistory> changeHistory;
    
    @PrePersist
    public void setDefaultValuesOnCreate() {
        // Tự động tạo session code nếu chưa có
        if (this.sessionCode == null || this.sessionCode.isEmpty()) {
            this.sessionCode = generateSessionCode();
        }
    }
    
    // Helper method để tạo session code
    private String generateSessionCode() {
        String year = String.valueOf(java.time.LocalDate.now().getYear());
        String month = String.format("%02d", java.time.LocalDate.now().getMonthValue());
        String day = String.format("%02d", java.time.LocalDate.now().getDayOfMonth());
        String time = String.format("%02d%02d", 
            java.time.LocalTime.now().getHour(), 
            java.time.LocalTime.now().getMinute());
        return String.format("SS-%s%s%s-%s", year.substring(2), month, day, time);
    }
}
