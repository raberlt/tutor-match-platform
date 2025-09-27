package fsa.training.tutormatch.entity;

import fsa.training.tutormatch.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Entity
@Data
@Table(name = "sessions")
@EqualsAndHashCode(exclude = {"booking"})
@ToString(exclude = {"booking"})
public class Session {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
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
    
    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.SCHEDULED;
    
    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
    
    @Column(name = "completed_at")
    private ZonedDateTime completedAt;
}
