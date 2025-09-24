package fsa.training.tutormatch.entity;

import fsa.training.tutormatch.enums.EducationLevel;
import fsa.training.tutormatch.enums.ProfileStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"bookingsAsStudent"})  // ✅ Exclude collections
@ToString(exclude = {"bookingsAsStudent"})                            // ✅ Exclude collections
@Table(name = "student_profiles")
public class StudentProfile extends Profile {
    
    public StudentProfile() {
        super();
        // Mặc định StudentProfile có status ACTIVE
        this.setProfileStatus(ProfileStatus.ACTIVE);
    }

    // Student-specific fields
    @Enumerated(EnumType.STRING)
    private EducationLevel educationLevel;
    
    // Personal information fields are now in User entity only
    // Use getFirstName(), getLastName(), getImageAvatar() methods to access from User

    // Student bookings (as student)
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Booking> bookingsAsStudent;

    @Override
    public String getDisplayName() {
        return "Student Profile";
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
    public boolean canBePromoted() {
        return super.getProfileStatus() == ProfileStatus.ACTIVE &&
                educationLevel != null &&
                (educationLevel == EducationLevel.COLLEGE_UNIVERSITY || 
                 educationLevel == EducationLevel.POSTGRADUATE);
    }

    // Business methods
    public boolean hasValidEducationLevel() {
        return educationLevel != null;
    }

    public String getEducationLevelDisplayName() {
        return educationLevel != null ? educationLevel.getDisplayName() : "Chưa xác định";
    }
}
