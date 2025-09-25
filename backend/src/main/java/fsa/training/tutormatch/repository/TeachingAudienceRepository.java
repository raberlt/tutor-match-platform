package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.TeachingAudience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeachingAudienceRepository extends JpaRepository<TeachingAudience, Long> {
    Optional<TeachingAudience> findByName(String name);
    List<TeachingAudience> findByNameIn(List<String> names);
}
