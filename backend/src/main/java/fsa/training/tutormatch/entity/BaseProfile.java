package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Date;
import java.sql.Timestamp;

@Data
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@EqualsAndHashCode(exclude = {"user"})  // ✅ Exclude user khỏi equals/hashCode
@ToString(exclude = {"user"})           // ✅ Exclude user khỏi toString
public abstract class BaseProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Common fields for all profiles
    private Date dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @Column(columnDefinition = "NVARCHAR(20)")
    private String phoneNumber;
    
    @Column(columnDefinition = "NVARCHAR(255)")
    private String addressLine1;
    
    @Column(columnDefinition = "NVARCHAR(100)")
    private String city;
    
    @Column(columnDefinition = "NVARCHAR(100)")
    private String educationLevel;
    
    @Column(columnDefinition = "NVARCHAR(255)")
    private String university;
    
    @Column(columnDefinition = "NVARCHAR(255)")
    private String major;
    
    @Column(nullable = false)
    private boolean isVerified = false;
    
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "NVARCHAR(50)")
    private ProfileStatus profileStatus = ProfileStatus.ACTIVE;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
    
    // Admin fields
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    private Timestamp approvedAt;
    
    @Column(columnDefinition = "NVARCHAR(500)")
    private String adminNote;
    
    public enum Gender {
        MALE, FEMALE, OTHER
    }
    
    public enum ProfileStatus {
        ACTIVE,                // Đã duyệt và hoạt động
        INACTIVE,             // Không hoạt động
        SUSPENDED,            // Bị tạm khóa
        PENDING_VERIFICATION, // Chờ admin duyệt (cho tutor application)
        REJECTED              // Bị từ chối
    }
    
    // Abstract methods that subclasses must implement
    public abstract String getDisplayName();
    public abstract boolean canBePromoted();
} 