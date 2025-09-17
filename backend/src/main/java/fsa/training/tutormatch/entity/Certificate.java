package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Data
@Table(name = "certificates")
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Trỏ đến BaseProfile thay vì Profile
    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private BaseProfile profile;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String issuedBy;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String description;

    private String certImage;

    @Column(columnDefinition = "BIT DEFAULT 0")
    private Boolean valid = false;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
}
