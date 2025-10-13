package fsa.training.tutormatch.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.enums.Gender;
import fsa.training.tutormatch.enums.EducationLevel;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDate; 
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "users")
@EqualsAndHashCode(exclude = {"tutorProfiles"})
@ToString(exclude = {"tutorProfiles"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
    @Column(nullable = false, unique = true, columnDefinition = "NVARCHAR(50)")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(nullable = false)
    private String password;

    // Personal information fields (chuyển từ Profile về User)
    @NotBlank(message = "First name is required")
    @Column(nullable = false, columnDefinition = "NVARCHAR(50)")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false, columnDefinition = "NVARCHAR(50)")
    private String lastName;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String imageAvatar;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    // Timezone field mới
    @Column(columnDefinition = "NVARCHAR(50)", nullable = false)
    private String timezone = "Asia/Ho_Chi_Minh"; // Default timezone
    
    // Getter method for timezone field
    public String getTimezone() {
        return this.timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    // Trạng thái xác thực của user (dành cho tutor)
    @Column(nullable = false)
    private boolean isVerified = false;

    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @Pattern(regexp = "^[0-9]{9,15}$", message = "Phone number must be 9 to 15 digits")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private EducationLevel educationLevel;
    
    // Credit system - đồng tiền của hệ thống
    @Column(name = "credit_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal creditBalance = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private boolean enable = true;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private java.util.List<TutorProfile> tutors;

    @NotNull(message = "Role is required")
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.STUDENT;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;


    public java.util.Optional<TutorProfile> getTutorProfile() {
        if (tutors == null || tutors.isEmpty()) {
            return java.util.Optional.empty();
        }
        return java.util.Optional.of(tutors.get(0));
    }
    
    // Helper methods for timezone handling
    public ZonedDateTime getCreatedAtInTimezone(String timezoneId) {
        return createdAt != null ? createdAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    public ZonedDateTime getUpdatedAtInTimezone(String timezoneId) {
        return updatedAt != null ? updatedAt.withZoneSameInstant(ZoneId.of(timezoneId)) : null;
    }
    
    // Helper methods using user's own timezone
    public ZonedDateTime getCreatedAtInUserTimezone() {
        return getCreatedAtInTimezone(this.timezone);
    }
    
    public ZonedDateTime getUpdatedAtInUserTimezone() {
        return getUpdatedAtInTimezone(this.timezone);
    }
    
    // Get user's display name
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        return username;
    }
    
    // Credit management methods
    public boolean hasEnoughCredit(BigDecimal amount) {
        return creditBalance != null && creditBalance.compareTo(amount) >= 0;
    }

    public void addCredit(BigDecimal amount) {
        if (creditBalance == null) {
            creditBalance = BigDecimal.ZERO;
        }
        creditBalance = creditBalance.add(amount);
    }

    public void deductCredit(BigDecimal amount) {
        if (creditBalance == null) {
            creditBalance = BigDecimal.ZERO;
        }
        if (hasEnoughCredit(amount)) {
            creditBalance = creditBalance.subtract(amount);
        } else {
            throw new IllegalArgumentException("Insufficient credit balance");
        }
    }

    public BigDecimal getCreditBalance() {
        return creditBalance != null ? creditBalance : BigDecimal.ZERO;
    }
}