package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.BaseProfile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.factory.ProfileFactory;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.interfaces.IProfileService;
import fsa.training.tutormatch.service.interfaces.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileServiceImpl implements IProfileService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProfileFactory profileFactory;
    
    @Autowired
    private IUserService userService;

    @Override
    @Transactional
    public StudentProfile createStudentProfile(User user) {
        if (user.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User must be a STUDENT to create student profile");
        }
        
        StudentProfile profile = profileFactory.createStudentProfile(user);
        // user has many profiles now; profile already references user
        userRepository.save(user);
        
        return profile;
    }

    @Override
    @Transactional
    public TutorProfile createTutorProfile(User user) {
        if (user.getRole() != User.Role.TUTOR && user.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User must be STUDENT or TUTOR to create tutor profile");
        }
        
        TutorProfile profile = profileFactory.createTutorProfile(user);
        // user has many profiles now; profile already references user
        userRepository.save(user);
        
        return profile;
    }

    @Override
    @Transactional
    public BaseProfile createProfile(User user, User.Role targetRole) {
        // Factory method delegates to specific creation methods
        switch (targetRole) {
            case STUDENT:
                return createStudentProfile(user);
            case TUTOR:
                return createTutorProfile(user);
            default:
                throw new IllegalArgumentException("Cannot create profile for role: " + targetRole);
        }
    }

    @Override
    public Optional<BaseProfile> findProfileByUserId(Integer userId) {
        // Prefer tutor profile if exists, else student profile
        return userService.findById(userId)
                .flatMap(u -> u.getTutorProfile().map(p -> (BaseProfile) p)
                        .or(() -> u.getStudentProfile().map(p -> (BaseProfile) p)));
    }

    @Override
    public Optional<StudentProfile> findStudentProfile(Integer userId) {
        return userService.findById(userId).flatMap(User::getStudentProfile);
    }

    @Override
    public Optional<TutorProfile> findTutorProfile(Integer userId) {
        return userService.findById(userId).flatMap(User::getTutorProfile);
    }

    @Override
    @Transactional
    public BaseProfile updateProfile(BaseProfile profile) {
        if (profile == null) {
            throw new IllegalArgumentException("Profile cannot be null");
        }
        
        userRepository.save(profile.getUser());
        
        return profile;
    }

    @Override
    @Transactional
    public boolean deleteProfile(Integer profileId) {
        // With multi-profiles, deletion should be handled in specific services
        return false;
    }

    @Override
    public boolean canUserCreateProfile(User user, User.Role targetRole) {
        if (user == null || targetRole == null) {
            return false;
        }
        
        // User can create student profile if they are student and don't have student profile
        if (targetRole == User.Role.STUDENT) {
            return user.getRole() == User.Role.STUDENT && user.getStudentProfile().isEmpty();
        }
        
        // User can create tutor profile if they are student/tutor and either no profile or rejected tutor profile
        if (targetRole == User.Role.TUTOR) {
            if (user.getRole() != User.Role.STUDENT && user.getRole() != User.Role.TUTOR) {
                return false;
            }
            
            return user.getTutorProfile()
                    .map(p -> p.getProfileStatus() == BaseProfile.ProfileStatus.REJECTED)
                    .orElse(true);
        }
        
        return false;
    }

    public boolean isProfileComplete(BaseProfile profile) {
        if (profile == null) {
            return false;
        } 
        
        // Check common required fields
        boolean commonComplete = profile.getDateOfBirth() != null &&
                               profile.getGender() != null &&
                               profile.getPhoneNumber() != null &&
                               profile.getCity() != null;
        
        if (!commonComplete) {
            return false;
        }
        
        // Check type-specific requirements
        if (profile instanceof StudentProfile) {
            return isStudentProfileComplete((StudentProfile) profile);
        } else if (profile instanceof TutorProfile) {
            return isTutorProfileComplete((TutorProfile) profile);
        }
        
        return false;
    }

    @Transactional
    public TutorProfile promoteStudentToTutor(Integer studentUserId) {
        Optional<User> userOpt = userService.findById(studentUserId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Student not found");
        }
        
        User student = userOpt.get();
        if (student.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User is not a student");
        }
        
        // Create tutor profile
        TutorProfile tutorProfile = createTutorProfile(student);
        
        // Update user role
        student.setRole(User.Role.TUTOR);
        userRepository.save(student);
        
        return tutorProfile;
    }
    
    private boolean isStudentProfileComplete(StudentProfile profile) {
        return profile.getLearningGoals() != null &&
               !profile.getLearningGoals().trim().isEmpty();
    }
    
    private boolean isTutorProfileComplete(TutorProfile profile) {
        // ✅ Kiểm tra required fields trong business logic thay vì database
        return profile.getBio() != null && !profile.getBio().trim().isEmpty() &&
               profile.getHeadline() != null && !profile.getHeadline().trim().isEmpty() &&
               profile.getExperience() != null && !profile.getExperience().trim().isEmpty() &&
               profile.getTeachingLevel() != null && !profile.getTeachingLevel().trim().isEmpty() &&
               profile.getFees() != null && profile.getFees() > 0;
    }
} 
 
 