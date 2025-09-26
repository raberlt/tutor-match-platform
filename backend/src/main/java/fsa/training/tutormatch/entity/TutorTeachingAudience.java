package fsa.training.tutormatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Data
@EqualsAndHashCode(exclude = {"tutorProfile", "teachingAudience"})
@ToString(exclude = {"tutorProfile", "teachingAudience"})
@Table(name = "tutor_teaching_audiences")
public class TutorTeachingAudience {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_profile_id", nullable = false)
    private TutorProfile tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teaching_audience_id", nullable = false)
    private TeachingAudience teachingAudience;
}
