package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.time.ZoneId;

@Entity
@Data
@Table(name = "educations")
public class Education {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private TutorProfile profile;

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String schoolName;

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String degree;  // đổi từ Enum sang String

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String major;

    @Column(nullable = false)
    private Integer fromTime;

    @Column(nullable = false)
    private Integer toTime;

    private String degreeFileName;
    
    @Column(columnDefinition = "NVARCHAR(500)")
    private String degreeFileUrl;

    private Boolean valid = false;
    
    @Column(nullable = false)
    private boolean isVerified = false;

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