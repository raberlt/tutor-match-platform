package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ApplicationTeachingAudience;
import fsa.training.tutormatch.entity.ProfileApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationTeachingAudienceRepository extends JpaRepository<ApplicationTeachingAudience, Long> {
    List<ApplicationTeachingAudience> findByApplication(ProfileApplication application);
}
