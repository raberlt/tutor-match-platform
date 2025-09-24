package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ApplicationSchedule;
import fsa.training.tutormatch.entity.ProfileApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationScheduleRepository extends JpaRepository<ApplicationSchedule, Long> {
    
    List<ApplicationSchedule> findByApplication(ProfileApplication application);
    
    void deleteByApplication(ProfileApplication application);
}
