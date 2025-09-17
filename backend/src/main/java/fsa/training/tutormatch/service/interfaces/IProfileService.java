package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.entity.BaseProfile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import java.util.List;
import java.util.Optional;

public interface IProfileService {
    StudentProfile createStudentProfile(User user);
    TutorProfile createTutorProfile(User user);
    BaseProfile createProfile(User user, User.Role targetRole);
    Optional<BaseProfile> findProfileByUserId(Integer userId);
    Optional<StudentProfile> findStudentProfile(Integer userId);
    Optional<TutorProfile> findTutorProfile(Integer userId);
    BaseProfile updateProfile(BaseProfile profile);
    boolean deleteProfile(Integer profileId);
    boolean canUserCreateProfile(User user, User.Role targetRole);
    
    // Compatibility methods
    default BaseProfile save(BaseProfile profile) {
        return updateProfile(profile);
    }
    
    default BaseProfile save(BaseProfile profile, String username) {
        return updateProfile(profile);
    }
    
    default Optional<BaseProfile> findByUserId(Integer userId) {
        return findProfileByUserId(userId);
    }
}
