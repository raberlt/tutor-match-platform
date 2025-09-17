package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Integer> {
    List<Education> findByProfileId(Integer profileId);
    void deleteByProfileId(Integer profileId);
} 