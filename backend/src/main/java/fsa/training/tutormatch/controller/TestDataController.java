package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.ProfileStatus;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/test")
public class TestDataController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create-test-data")
    public ResponseEntity<?> createTestData() {
        try {
            // Create test users
            List<User> testUsers = new ArrayList<>();
            
            // Create tutor users
            for (int i = 1; i <= 5; i++) {
                User tutorUser = new User();
                String timestamp = String.valueOf(System.currentTimeMillis());
                tutorUser.setUsername("tutor" + i + "_" + timestamp + "@example.com");
                tutorUser.setEmail("tutor" + i + "_" + timestamp + "@example.com");
                tutorUser.setPassword(passwordEncoder.encode("password123"));
                tutorUser.setFirstName("Gia sư");
                tutorUser.setLastName("Số " + i);
                tutorUser.setPhoneNumber("012345678" + i);
                tutorUser.setRole(UserRole.TUTOR);
                tutorUser.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                tutorUser.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                
                testUsers.add(userRepository.save(tutorUser));
            }
            
            // Get subjects
            List<Subject> subjects = subjectRepository.findAll();
            if (subjects.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "No subjects found in database"
                ));
            }
            
            // Create tutor profiles
            List<TutorProfile> profiles = new ArrayList<>();
            for (int i = 0; i < testUsers.size(); i++) {
                User user = testUsers.get(i);
                
                TutorProfile profile = new TutorProfile();
                profile.setUser(user);
                profile.setBio("Gia sư có kinh nghiệm " + (i + 1) + " năm trong việc giảng dạy. Tôi có thể giúp học sinh cải thiện điểm số và hiểu sâu hơn về môn học.");
                profile.setHeadline("Gia sư chuyên nghiệp - " + (i + 1) + " năm kinh nghiệm");
                profile.setExperience("Có " + (i + 1) + " năm kinh nghiệm giảng dạy, từng giúp nhiều học sinh đạt điểm cao");
                profile.setTeachingLevel("HIGH_SCHOOL");
                profile.setCvUrl("https://example.com/cv" + (i + 1) + ".pdf");
                profile.setVideoIntro("https://example.com/video" + (i + 1) + ".mp4");
                profile.setProfileStatus(ProfileStatus.ACTIVE);
                profile.setDraft(false);
                profile.setRatePointAverage(4.0 + (i * 0.2)); // Different ratings
                profile.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                profile.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                
                TutorProfile savedProfile = profileRepository.save(profile);
                
                // Create profile subjects
                List<TutorProfileSubject> profileSubjects = new ArrayList<>();
                
                // Assign 2-3 subjects per tutor
                int subjectCount = Math.min(3, subjects.size());
                for (int j = 0; j < subjectCount; j++) {
                    Subject subject = subjects.get((i + j) % subjects.size());
                    
                    TutorProfileSubject profileSubject = new TutorProfileSubject();
                    profileSubject.setProfile(savedProfile);
                    profileSubject.setSubject(subject);
                    profileSubject.setFees(100000 + (i * 50000) + (j * 25000)); // Different fees
                    profileSubject.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                    profileSubject.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                    
                    profileSubjects.add(profileSubject);
                }
                
                savedProfile.setProfileSubjects(profileSubjects);
                profiles.add(profileRepository.save(savedProfile));
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test data created successfully",
                "users_created", testUsers.size(),
                "profiles_created", profiles.size(),
                "subjects_available", subjects.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Error creating test data: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/clear-test-data")
    public ResponseEntity<?> clearTestData() {
        try {
            // Delete all profiles with id >= 152 (test data)
            List<Profile> testProfiles = profileRepository.findAll().stream()
                .filter(profile -> profile.getId() >= 152)
                .collect(java.util.stream.Collectors.toList());
            
            for (Profile profile : testProfiles) {
                profileRepository.delete(profile);
            }
            
            // Delete all users with id >= 8 (test users)
            List<User> testUsers = userRepository.findAll().stream()
                .filter(user -> user.getId() >= 8)
                .collect(java.util.stream.Collectors.toList());
            
            for (User user : testUsers) {
                userRepository.delete(user);
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test data cleared successfully",
                "deleted_profiles", testProfiles.size(),
                "deleted_users", testUsers.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Error clearing test data: " + e.getMessage()
            ));
        }
    }
}
