package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.ZonedDateTime;
import java.time.ZoneId;

@Data
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@EqualsAndHashCode(exclude = {"user"})
@ToString(exclude = {"user"})
public abstract class Profile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @Column(columnDefinition = "BIT DEFAULT 1")
    private Boolean enable = true;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
    
    
    // Abstract methods that subclasses must implement
    public abstract String getDisplayName();
    public abstract boolean canBePromoted();
    
    // Helper methods for timezone handling
    public ZonedDateTime getCreatedAtInTimezone(String timezoneId) {
        return createdAt != null ? createdAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    public ZonedDateTime getUpdatedAtInTimezone(String timezoneId) {
        return updatedAt != null ? updatedAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    // Helper methods using user's timezone
    public ZonedDateTime getCreatedAtInUserTimezone() {
        return user != null ? getCreatedAtInTimezone(user.getTimezone()) : createdAt;
    }
    
    public ZonedDateTime getUpdatedAtInUserTimezone() {
        return user != null ? getUpdatedAtInTimezone(user.getTimezone()) : updatedAt;
    }
}