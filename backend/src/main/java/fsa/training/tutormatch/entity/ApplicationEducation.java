package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Data
@EqualsAndHashCode(exclude = {"application"})
@ToString(exclude = {"application"})
@Table(name = "application_educations")
public class ApplicationEducation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private ProfileApplication application;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String schoolName;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String degree;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String major;

    private Integer fromTime;
    
    private Integer toTime;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String degreeImage;
}
