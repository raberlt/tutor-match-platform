package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.ZoneId;

@Entity
@Data
@EqualsAndHashCode(exclude = {"application", "tutorProfile"})
@ToString(exclude = {"application", "tutorProfile"})
@Table(name = "application_schedules")
public class ApplicationSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = true)
    private ProfileApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_profile_id", nullable = true)
    private TutorProfile tutorProfile;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String dayOfWeek;

    private LocalTime fromTime;
    
    private LocalTime toTime;

    @Column(nullable = false)
    private Boolean enable = true;

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
    
    // Helper methods using application's user timezone
    public ZonedDateTime getCreatedAtInUserTimezone() {
        return application != null && application.getUser() != null ? 
            getCreatedAtInTimezone(application.getUser().getTimezone()) : createdAt;
    }
    
    public ZonedDateTime getUpdatedAtInUserTimezone() {
        return application != null && application.getUser() != null ? 
            getUpdatedAtInTimezone(application.getUser().getTimezone()) : updatedAt;
    }
}
