package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ApplicationSubjectFee;
import fsa.training.tutormatch.entity.ProfileApplication;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationSubjectFeeRepository extends JpaRepository<ApplicationSubjectFee, Long> {
    
    // New methods for TutorProfile
    List<ApplicationSubjectFee> findByTutorProfile(TutorProfile tutorProfile);
    List<ApplicationSubjectFee> findByTutorProfileId(Integer tutorProfileId);
    void deleteByTutorProfile(TutorProfile tutorProfile);
    void deleteByTutorProfileId(Integer tutorProfileId);
    boolean existsByTutorProfileAndSubject(TutorProfile tutorProfile, Subject subject);
    
    // Methods for ProfileApplication
    List<ApplicationSubjectFee> findByApplication(ProfileApplication application);
    List<ApplicationSubjectFee> findByApplicationId(Long applicationId);
    void deleteByApplication(ProfileApplication application);
    void deleteByApplicationId(Long applicationId);
    boolean existsByApplicationAndSubject(ProfileApplication application, Subject subject);
    
    List<ApplicationSubjectFee> findBySubject(Subject subject);
}
