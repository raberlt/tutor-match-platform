package fsa.training.tutormatch.entity;

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
public class StudentProfile extends BaseProfile {

    // Student-specific fields
    @Column(columnDefinition = "NVARCHAR(500)")
    private String learningGoals;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String preferredSubjects;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String learningStyle;

    private Integer budgetMin;
    private Integer budgetMax;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String preferredTimeSlots;

    // Student bookings (as student)
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Booking> bookingsAsStudent;

    // ❌ Bỏ: Quan hệ trực tiếp với Rate (ratingsGiven)
    // Vì Rate → Booking → Student đã đủ

    @Override
    public String getDisplayName() {
        return "Student Profile";
    }

    @Override
    public boolean canBePromoted() {
        return super.isVerified() &&
                super.getProfileStatus() == ProfileStatus.ACTIVE &&
                super.getEducationLevel() != null &&
                !super.getEducationLevel().isEmpty();
    }

    // Business methods
    public boolean hasActiveLearningGoals() {
        return learningGoals != null && !learningGoals.trim().isEmpty();
    }

    public boolean isWithinBudget(Integer fees) {
        if (budgetMin != null && fees < budgetMin) return false;
        if (budgetMax != null && fees > budgetMax) return false;
        return true;
    }
}
