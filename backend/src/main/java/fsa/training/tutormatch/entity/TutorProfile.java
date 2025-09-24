package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import fsa.training.tutormatch.enums.ProfileStatus;

import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"profileSubjects", "schedules", "educations", "certificates", "bookingsAsTutor", "approvedBy"})
@ToString(exclude = {"profileSubjects", "schedules", "educations", "certificates", "bookingsAsTutor", "approvedBy"})
@Table(name = "tutor_profiles")
public class TutorProfile extends Profile {
    
    public TutorProfile() {
        super();
        // Mặc định TutorProfile có status INACTIVE
        this.setProfileStatus(ProfileStatus.INACTIVE);
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

    @Column(nullable = true, columnDefinition = "NVARCHAR(2000)")
    private String teachingLevel = "";

    // Optional fields
    private String videoIntro;

    @Column(columnDefinition = "FLOAT DEFAULT 0")
    private Double ratePointAverage = 0.0;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer totalPoint = 0;

    // CV URL - link đến CV của tutor
    @Column(columnDefinition = "NVARCHAR(500)")
    private String cvUrl;

    // isDraft - cho biết profile có đang ở trạng thái draft không
    // true: bản nháp (chỉ user và admin thấy)
    // false: bản công khai (tất cả đều thấy)
    @Column(nullable = false)
    private boolean isDraft = true;

    // Admin fields (chuyển từ Profile)
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    private ZonedDateTime approvedAt;
    
    @Column(columnDefinition = "NVARCHAR(500)")
    private String adminNote;

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
    public void setProfileStatus(fsa.training.tutormatch.enums.ProfileStatus profileStatus) {
        super.setProfileStatus(profileStatus);
    }
    
    @Override
    public User getUser() {
        return super.getUser();
    }
    
    @Override
    public fsa.training.tutormatch.enums.ProfileStatus getProfileStatus() {
        return super.getProfileStatus();
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
    
    public String getTeachingLevel() {
        return this.teachingLevel;
    }
    
    public void setTeachingLevel(String teachingLevel) {
        this.teachingLevel = teachingLevel;
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
        return super.getProfileStatus() == ProfileStatus.ACTIVE &&
                getUser() != null && getUser().isVerified() &&
                !isDraft &&
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

    // Helper methods for admin fields with timezone support
    public ZonedDateTime getApprovedAtInTimezone(String timezoneId) {
        return approvedAt != null ? approvedAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    public ZonedDateTime getApprovedAtInUserTimezone() {
        return getUser() != null ? getApprovedAtInTimezone(getUser().getTimezone()) : approvedAt;
    }

    // Helper method to check if approved
    public boolean isApproved() {
        return approvedBy != null && approvedAt != null;
    }

    // Helper method to get approver name
    public String getApproverName() {
        return approvedBy != null ? approvedBy.getFullName() : null;
    }
}