package fsa.training.tutormatch.entity;

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
@Table(name = "session_change_history")
@EqualsAndHashCode(exclude = {"session"})
@ToString(exclude = {"session"})
public class SessionChangeHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Foreign Key to Session
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;
    
    // Old values
    @Column(name = "old_date", nullable = false)
    private LocalDate oldDate;
    
    @Column(name = "old_start_time", nullable = false)
    private LocalTime oldStartTime;
    
    // New values
    @Column(name = "new_date", nullable = false)
    private LocalDate newDate;
    
    @Column(name = "new_start_time", nullable = false)
    private LocalTime newStartTime;
    
    // When the change happened
    @Column(name = "changed_at", nullable = false)
    private ZonedDateTime changedAt;
    
    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
