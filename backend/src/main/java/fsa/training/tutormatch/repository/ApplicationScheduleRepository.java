package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ApplicationSchedule;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.ProfileApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationScheduleRepository extends JpaRepository<ApplicationSchedule, Long> {
    
    // Methods for ProfileApplication
    List<ApplicationSchedule> findByApplication(ProfileApplication application);
    List<ApplicationSchedule> findByApplicationIdAndEnableTrue(Long applicationId);
    List<ApplicationSchedule> findByApplicationId(Long applicationId);
    void deleteByApplication(ProfileApplication application);
    void deleteByApplicationId(Long applicationId);
}
