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

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "users")
@EqualsAndHashCode(exclude = {"profiles"})
@ToString(exclude = {"profiles"})
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

    @NotBlank(message = "First name is required")
    @Column(nullable = false, columnDefinition = "NVARCHAR(50)")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false, columnDefinition = "NVARCHAR(50)")
    private String lastName;

    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @Pattern(regexp = "^[0-9]{9,15}$", message = "Phone number must be 9 to 15 digits")
    private String phoneNumber;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String imageAvatar;

    @Column(columnDefinition = "NVARCHAR(20)")
    private String phone;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean isPremium = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<BaseProfile> profiles;

    @NotNull(message = "Role is required")
    @Enumerated(EnumType.STRING)
    private Role role = Role.STUDENT;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    public enum Role {
        ADMIN, STUDENT, TUTOR
    }

    // Helper methods
    public java.util.Optional<StudentProfile> getStudentProfile() {
        if (profiles == null) return java.util.Optional.empty();
        for (BaseProfile profile : profiles) {
            if (profile instanceof StudentProfile) {
                return java.util.Optional.of((StudentProfile) profile);
            }
        }
        return java.util.Optional.empty();
    }

    public java.util.Optional<TutorProfile> getTutorProfile() {
        if (profiles == null) return java.util.Optional.empty();
        for (BaseProfile profile : profiles) {
            if (profile instanceof TutorProfile) {
                return java.util.Optional.of((TutorProfile) profile);
            }
        }
        return java.util.Optional.empty();
    }
}
