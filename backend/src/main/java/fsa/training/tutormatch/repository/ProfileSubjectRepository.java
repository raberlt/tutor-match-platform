package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ProfileSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileSubjectRepository extends JpaRepository<ProfileSubject, Integer> {
    List<ProfileSubject> findByProfileId(Integer profileId);
    void deleteByProfileId(Integer profileId);
} 