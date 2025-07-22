package fsa.training.tutormatch.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Data
@Table(name = "profiles")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "tutor_id", nullable = false, unique = true)
    @JsonIgnore
    @ToString.Exclude
    private User tutor;

    @Column(nullable = false, columnDefinition = "NVARCHAR(2000)")
    private String bio;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String headline;

    @Column(nullable = false, columnDefinition = "NVARCHAR(2000)")
    private String experience;

    @Column(nullable = false, columnDefinition = "NVARCHAR(2000)")
    private String teachingLevel;

    @Column(nullable = false)
    private Integer fees;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProfileSubject> profileSubjects;

    private String videoIntro;
    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
}
