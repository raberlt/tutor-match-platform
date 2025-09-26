package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.TutorTeachingAudience;
import fsa.training.tutormatch.entity.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TutorTeachingAudienceRepository extends JpaRepository<TutorTeachingAudience, Long> {
    List<TutorTeachingAudience> findByTutorProfile(TutorProfile tutorProfile);
}
