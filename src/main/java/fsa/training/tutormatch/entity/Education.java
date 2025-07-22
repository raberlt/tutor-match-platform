package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Data
@Table(name = "educations")
public class Education {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String schoolName;

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String degree;  // đổi từ Enum sang String

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String major;

    @Column(nullable = false)
    private Integer fromTime;

    @Column(nullable = false)
    private Integer toTime;

    private String degreeImage;

    private Boolean valid = false;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
}
