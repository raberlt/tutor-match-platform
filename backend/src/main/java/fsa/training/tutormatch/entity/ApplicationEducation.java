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
@EqualsAndHashCode(exclude = {"application"})
@ToString(exclude = {"application"})
@Table(name = "application_educations")
public class ApplicationEducation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private ProfileApplication application;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String schoolName;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String degree;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String major;

    private Integer fromTime;
    
    private Integer toTime;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String degreeFileName;
    @Column(columnDefinition = "NVARCHAR(500)")
    private String degreeFileUrl;
    
    @Column(name = "verified", nullable = false)
    private boolean verified = false;

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