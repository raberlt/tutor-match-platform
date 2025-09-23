package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.UserRole;

import java.util.Optional;

public interface IProfileService {
    StudentProfile createStudentProfile(User user);
    TutorProfile createTutorProfile(User user);
    Profile createProfile(User user, UserRole targetRole);
    Optional<Profile> findProfileByUserId(Integer userId);
    Optional<StudentProfile> findStudentProfile(Integer userId);
    Optional<TutorProfile> findTutorProfile(Integer userId);
    Profile updateProfile(Profile profile);
    boolean deleteProfile(Integer profileId);
    boolean canUserCreateProfile(User user, UserRole targetRole);
    
    // Compatibility methods
    default Profile save(Profile profile) {
        return updateProfile(profile);
    }
    
    default Profile save(Profile profile, String username) {
        return updateProfile(profile);
    }
    
    default Optional<Profile> findByUserId(Integer userId) {
        return findProfileByUserId(userId);
    }
}
