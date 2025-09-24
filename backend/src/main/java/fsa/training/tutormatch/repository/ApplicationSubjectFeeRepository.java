package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ApplicationSubjectFee;
import fsa.training.tutormatch.entity.ProfileApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationSubjectFeeRepository extends JpaRepository<ApplicationSubjectFee, Long> {
    
    List<ApplicationSubjectFee> findByApplication(ProfileApplication application);
    
    void deleteByApplication(ProfileApplication application);
}
