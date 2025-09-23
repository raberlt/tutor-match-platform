package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.TutorProfileSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileSubjectRepository extends JpaRepository<TutorProfileSubject, Integer> {
    List<TutorProfileSubject> findByProfileId(Integer profileId);
    void deleteByProfileId(Integer profileId);
} 