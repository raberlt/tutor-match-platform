package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.time.ZoneId;

@Entity
@Data
@Table(name = "certificates")
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Trỏ đến BaseProfile thay vì Profile
    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String issuedBy;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String description;

    private String certImage;

    @Column(columnDefinition = "BIT DEFAULT 0")
    private Boolean valid = false;
    
    // Getter method for valid field to match the naming convention
    public Boolean getValid() {
        return this.valid;
    }
    
    public void setValid(Boolean valid) {
        this.valid = valid;
    }

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