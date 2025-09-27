package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ApplicationTeachingAudience;
import fsa.training.tutormatch.entity.ProfileApplication;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.TeachingAudience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationTeachingAudienceRepository extends JpaRepository<ApplicationTeachingAudience, Long> {
    
    // New methods for TutorProfile
    List<ApplicationTeachingAudience> findByTutorProfile(TutorProfile tutorProfile);
    List<ApplicationTeachingAudience> findByTutorProfileId(Integer tutorProfileId);
    void deleteByTutorProfile(TutorProfile tutorProfile);
    void deleteByTutorProfileId(Integer tutorProfileId);
    boolean existsByTutorProfileAndTeachingAudience(TutorProfile tutorProfile, TeachingAudience teachingAudience);
    
    // Methods for ProfileApplication
    List<ApplicationTeachingAudience> findByApplication(ProfileApplication application);
    List<ApplicationTeachingAudience> findByApplicationId(Long applicationId);
    void deleteByApplication(ProfileApplication application);
    void deleteByApplicationId(Long applicationId);
    boolean existsByApplicationAndTeachingAudience(ProfileApplication application, TeachingAudience teachingAudience);
    
    List<ApplicationTeachingAudience> findByTeachingAudience(TeachingAudience teachingAudience);
}