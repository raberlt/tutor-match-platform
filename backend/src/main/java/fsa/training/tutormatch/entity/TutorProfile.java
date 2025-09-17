package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"profileSubjects", "schedules", "educations", "certificates", "bookingsAsTutor"})
@ToString(exclude = {"profileSubjects", "schedules", "educations", "certificates", "bookingsAsTutor"})
@Table(name = "tutor_profiles")
public class TutorProfile extends BaseProfile {

    // Tutor-specific fields
    @Column(nullable = true, columnDefinition = "NVARCHAR(2000)")
    private String bio = "";

    @Column(nullable = true, columnDefinition = "NVARCHAR(255)")
    private String headline = "";

    @Column(nullable = true, columnDefinition = "NVARCHAR(2000)")
    private String experience = "";

    @Column(nullable = true, columnDefinition = "NVARCHAR(2000)")
    private String teachingLevel = "";

    @Column(nullable = true)
    private Integer fees = 0;

    // Optional fields
    private String videoIntro;

    @Column(columnDefinition = "FLOAT DEFAULT 0")
    private Double ratePointAverage = 0.0;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer totalPoint = 0;

    // Relationships
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProfileSubject> profileSubjects;

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

    // Business methods
    public boolean isAvailableForBooking() {
        return super.getProfileStatus() == ProfileStatus.ACTIVE &&
                super.isVerified() &&
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
}
