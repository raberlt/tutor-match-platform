package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import fsa.training.tutormatch.enums.ApplicationStatus;
import fsa.training.tutormatch.enums.ApplicationType;
import fsa.training.tutormatch.enums.EducationLevel;
import fsa.training.tutormatch.enums.Gender;
import fsa.training.tutormatch.enums.TeachingLevel;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(exclude = {"user", "reviewedBy", "educations", "certificates", "schedules", "subjectFees"})
@ToString(exclude = {"user", "reviewedBy", "educations", "certificates", "schedules", "subjectFees"})
@Table(name = "profile_applications")
public class ProfileApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationType applicationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    // Personal Information (for admin approval)
    @Column(columnDefinition = "NVARCHAR(50)")
    private String firstName;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String lastName;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String imageAvatar;

    @Column(columnDefinition = "NVARCHAR(20)")
    private String phoneNumber;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String timezone;

    // Tutor-specific fields
    @Column(columnDefinition = "NVARCHAR(2000)")
    private String bio;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String headline;

    @Column(columnDefinition = "NVARCHAR(2000)")
    private String experience;

    @Enumerated(EnumType.STRING)
    private TeachingLevel teachingLevel;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String teachingMethods; // JSON string to store multiple teaching methods

    @Column(columnDefinition = "NVARCHAR(500)")
    private String cvUrl;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String videoIntro;

    // Student-specific fields
    @Enumerated(EnumType.STRING)
    private EducationLevel educationLevel;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    // Application workflow fields
    private ZonedDateTime submittedAt;
    
    private ZonedDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String adminNote;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String rejectionReason;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    // Related entities for applications
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ApplicationEducation> educations;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ApplicationCertificate> certificates;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ApplicationSchedule> schedules;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ApplicationSubjectFee> subjectFees;

    // Helper methods
    public boolean isDraft() {
        return status == ApplicationStatus.DRAFT;
    }

    public boolean isSubmitted() {
        return status == ApplicationStatus.SUBMITTED || status == ApplicationStatus.UNDER_REVIEW;
    }

    public boolean isApproved() {
        return status == ApplicationStatus.APPROVED;
    }

    public boolean isRejected() {
        return status == ApplicationStatus.REJECTED;
    }

    public void submit() {
        if (!isDraft()) {
            throw new IllegalStateException("Can only submit draft applications");
        }
        this.status = ApplicationStatus.SUBMITTED;
        this.submittedAt = ZonedDateTime.now();
    }

    public void approve(User admin, String note) {
        if (!isSubmitted()) {
            throw new IllegalStateException("Can only approve submitted applications");
        }
        this.status = ApplicationStatus.APPROVED;
        this.reviewedBy = admin;
        this.reviewedAt = ZonedDateTime.now();
        this.adminNote = note;
    }

    public void reject(User admin, String reason) {
        if (!isSubmitted()) {
            throw new IllegalStateException("Can only reject submitted applications");
        }
        this.status = ApplicationStatus.REJECTED;
        this.reviewedBy = admin;
        this.reviewedAt = ZonedDateTime.now();
        this.rejectionReason = reason;
    }
}
