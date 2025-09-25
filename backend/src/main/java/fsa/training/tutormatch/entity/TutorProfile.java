package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import fsa.training.tutormatch.entity.TeachingAudience;
import java.util.List;
import java.util.Set;

@Entity
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"profileSubjects", "schedules", "educations", "certificates", "bookingsAsTutor", "teachingAudiences"})
@ToString(exclude = {"profileSubjects", "schedules", "educations", "certificates", "bookingsAsTutor", "teachingAudiences"})
@Table(name = "tutor_profiles")
public class TutorProfile extends Profile {
    
    public TutorProfile() {
        super();
        // Mặc định TutorProfile được enable
        this.setEnable(true);
    }

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

    // Relationships
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TutorProfileSubject> profileSubjects;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Schedule> schedules;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Education> educations;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Certificate> certificates;

    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Booking> bookingsAsTutor;

    // Many-to-Many relationship với TeachingAudience entity
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tutor_teaching_audiences",
        joinColumns = @JoinColumn(name = "tutor_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "teaching_audience_id")
    )
    private Set<TeachingAudience> teachingAudiences;

    @Override
    public String getDisplayName() {
        return "Tutor: " + (headline != null ? headline : "Unknown");
    }

    @Override
    public boolean canBePromoted() {
        return false;
    }
    
    // Helper methods to access personal info from User
    public String getFirstName() {
        return getUser() != null ? getUser().getFirstName() : null;
    }
    
    public String getLastName() {
        return getUser() != null ? getUser().getLastName() : null;
    }
    
    public String getImageAvatar() {
        return getUser() != null ? getUser().getImageAvatar() : null;
    }
    
    // Override methods from parent to ensure they're accessible
    @Override
    public void setUser(User user) {
        super.setUser(user);
    }
    
    @Override
    public void setCreatedAt(java.time.ZonedDateTime createdAt) {
        super.setCreatedAt(createdAt);
    }
    
    @Override
    public void setUpdatedAt(java.time.ZonedDateTime updatedAt) {
        super.setUpdatedAt(updatedAt);
    }
    
    @Override
    public void setEnable(Boolean enable) {
        super.setEnable(enable);
    }
    
    @Override
    public User getUser() {
        return super.getUser();
    }
    
    @Override
    public Boolean getEnable() {
        return super.getEnable();
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
        return Boolean.TRUE.equals(super.getEnable()) &&
                getUser() != null && getUser().isVerified() &&
                schedules != null &&
                !schedules.isEmpty();
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
        // Trả về học phí trung bình hoặc học phí của môn đầu tiên
        if (profileSubjects != null && !profileSubjects.isEmpty()) {
            return profileSubjects.stream()
                    .mapToInt(subject -> subject.getFees())
                    .min()
                    .orElse(0);
        }
        return 0;
    }
    
    public Integer getMaxFees() {
        // Trả về học phí cao nhất
        if (profileSubjects != null && !profileSubjects.isEmpty()) {
            return profileSubjects.stream()
                    .mapToInt(subject -> subject.getFees())
                    .max()
                    .orElse(0);
        }
        return 0;
    }
    
    public Integer getAverageFees() {
        // Trả về học phí trung bình
        if (profileSubjects != null && !profileSubjects.isEmpty()) {
            return (int) profileSubjects.stream()
                    .mapToInt(subject -> subject.getFees())
                    .average()
                    .orElse(0);
        }
        return 0;
    }
    
    // Backward compatibility method - không làm gì cả vì fees giờ ở ProfileSubject
    public void setFees(Integer fees) {
        // Method này được giữ lại để tương thích ngược, nhưng không làm gì
        // Fees giờ được set riêng cho từng môn học trong TutorProfileSubject
    }

}