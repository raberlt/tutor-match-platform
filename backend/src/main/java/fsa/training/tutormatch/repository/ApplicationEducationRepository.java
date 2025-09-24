package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ApplicationEducation;
import fsa.training.tutormatch.entity.ProfileApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationEducationRepository extends JpaRepository<ApplicationEducation, Long> {
    
    List<ApplicationEducation> findByApplicationOrderByFromTimeDesc(ProfileApplication application);
    
    void deleteByApplication(ProfileApplication application);
}
