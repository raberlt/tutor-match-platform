package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Data
@EqualsAndHashCode(exclude = {"application"})
@ToString(exclude = {"application"})
@Table(name = "application_certificates")
public class ApplicationCertificate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private ProfileApplication application;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String name;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String issuedBy;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String description;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String certFileName;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String certFileUrl;

    @Column(nullable = false)
    private Boolean valid = true;
}
