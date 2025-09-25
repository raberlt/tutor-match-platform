package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Data
@EqualsAndHashCode(exclude = {"application", "teachingAudience"})
@ToString(exclude = {"application", "teachingAudience"})
@Table(name = "application_teaching_audiences")
public class ApplicationTeachingAudience {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private ProfileApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teaching_audience_id", nullable = false)
    private TeachingAudience teachingAudience;
}
