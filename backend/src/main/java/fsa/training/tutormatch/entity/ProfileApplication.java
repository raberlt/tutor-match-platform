package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import fsa.training.tutormatch.enums.ApplicationStatus;

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

    // Tutor-specific fields
    @Column(columnDefinition = "NVARCHAR(2000)")
    private String bio;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String headline;

    @Column(columnDefinition = "NVARCHAR(2000)")
    private String experience;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String cvFileUrl; 
    
    @Column(columnDefinition = "NVARCHAR(255)")
    private String cvFileName;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String videoIntro;

    // Application workflow fields
    private ZonedDateTime submittedAt;
    
    private ZonedDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String adminNote;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "application_teaching_audiences",
        joinColumns = @JoinColumn(name = "application_id"),
        inverseJoinColumns = @JoinColumn(name = "teaching_audience_id")
    )
    private List<TeachingAudience> teachingAudiences;

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
        this.adminNote = reason;
    }
}
