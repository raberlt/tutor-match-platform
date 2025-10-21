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
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Entity
@Data
@EqualsAndHashCode(exclude = {"user", "educations", "certificates", "bookingsAsTutor", "applicationTeachingAudiences", "applicationSubjectFees"})
@ToString(exclude = {"user", "educations", "certificates", "bookingsAsTutor", "applicationTeachingAudiences", "applicationSubjectFees"})
@Table(name = "tutor_profiles")
public class TutorProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    

    // Personal information fields are now in User entity only
    // Use getFirstName(), getLastName(), getImageAvatar() methods to access from User

    // Tutor-specific fields
    @Column(nullable = true, columnDefinition = "NVARCHAR(2000)")
    private String bio = "";

    @Column(nullable = true, columnDefinition = "NVARCHAR(255)")
    private String headline = "";

    @Column(nullable = true, columnDefinition = "NVARCHAR(2000)")
    private String experience = "";

    // Optional fields
    private String videoIntro;

    @Column(columnDefinition = "FLOAT DEFAULT 0")
    private Double ratePointAverage = 0.0;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer totalPoint = 0;

    // CV fields - chỉ URL
    @Column(columnDefinition = "NVARCHAR(500)")
    private String cvFileUrl;
    
    @Column(nullable = false)
    private boolean isVerified = false;

    // Location
    @Column(columnDefinition = "NVARCHAR(100)")
    private String city;

    // Status
    @Column(columnDefinition = "BIT DEFAULT 1")
    private Boolean isActive = true;

    // Relationships

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Education> educations;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Certificate> certificates;

    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Booking> bookingsAsTutor;

    @OneToMany(mappedBy = "tutorProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ApplicationTeachingAudience> applicationTeachingAudiences;

    @OneToMany(mappedBy = "tutorProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ApplicationSubjectFee> applicationSubjectFees;


    // Helper methods to access personal info from User
    public String getFirstName() {
        return user != null ? user.getFirstName() : null;
    }
    
    public String getLastName() {
        return user != null ? user.getLastName() : null;
    }
    
    public String getImageAvatar() {
        return user != null ? user.getImageAvatar() : null;
    }
    
    // Getter and setter methods for TutorProfile specific fields
    public String getBio() {
        return this.bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getHeadline() {
        return this.headline;
    }
    
    public void setHeadline(String headline) {
        this.headline = headline;
    }
    
    public String getExperience() {
        return this.experience;
    }
    
    public void setExperience(String experience) {
        this.experience = experience;
    }
    
    
    public String getVideoIntro() {
        return this.videoIntro;
    }
    
    public void setVideoIntro(String videoIntro) {
        this.videoIntro = videoIntro;
    }
    
    public Double getRatePointAverage() {
        return this.ratePointAverage;
    }
    
    public void setRatePointAverage(Double ratePointAverage) {
        this.ratePointAverage = ratePointAverage;
    }
    
    public Integer getTotalPoint() {
        return this.totalPoint;
    }
    
    public void setTotalPoint(Integer totalPoint) {
        this.totalPoint = totalPoint;
    }

    // Business methods
    public boolean isAvailableForBooking() {
        return Boolean.TRUE.equals(this.getEnable()) &&
                getUser() != null && getUser().isVerified();
    }

    public boolean hasRequiredCertifications() {
        return certificates != null &&
                certificates.stream().anyMatch(cert -> Boolean.TRUE.equals(cert.getValid()));
    }

    public boolean meetsMinimumExperienceRequirement() {
        return experience != null && experience.length() >= 100;
    }

    public double calculateAverageRating() {
        return ratePointAverage != null ? ratePointAverage : 0.0;
    }

    public long getTotalStudentsTaught() {
        return bookingsAsTutor != null ? bookingsAsTutor.size() : 0;
    }

    // Helper methods for fees (backward compatibility)
    public Integer getFees() {
        // Return 0 as fees are now managed separately
        return 0;
    }
    
    public Integer getMaxFees() {
        // Return 0 as fees are now managed separately
        return 0;
    }
    
    public Integer getAverageFees() {
        // Return 0 as fees are now managed separately
        return 0;
    }
    
    // Backward compatibility method - không làm gì cả vì fees giờ được quản lý riêng
    public void setFees(Integer fees) {
        // Method này được giữ lại để tương thích ngược, nhưng không làm gì
        // Fees giờ được quản lý riêng trong các entity khác
    }
    
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
    
    // Abstract methods that were in Profile
    public String getDisplayName() {
        if (user != null) {
            return user.getFullName();
        }
        return "Unknown Tutor";
    }
    
    public boolean canBePromoted() {
        return enable && user != null && user.isEnable();
    }
    
    // Getter for schedules (for backward compatibility)
    public List<ApplicationSchedule> getSchedules() {
        return new ArrayList<>(); // Return empty list as schedules are now managed separately
    }
    
    public void setSchedules(List<ApplicationSchedule> schedules) {
        // Method kept for backward compatibility but does nothing
        // Schedules are now managed separately through ProfileApplication
    }

}