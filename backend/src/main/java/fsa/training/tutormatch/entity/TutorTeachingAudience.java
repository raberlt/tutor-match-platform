package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.time.ZoneId;

@Entity
@Data
@EqualsAndHashCode(exclude = {"tutorProfile", "teachingAudience"})
@ToString(exclude = {"tutorProfile", "teachingAudience"})
@Table(name = "tutor_teaching_audiences")
public class TutorTeachingAudience {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_profile_id", nullable = false)
    private TutorProfile tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teaching_audience_id", nullable = false)
    private TeachingAudience teachingAudience;

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
}
