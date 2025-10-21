package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.enums.Gender;
import fsa.training.tutormatch.enums.EducationLevel;
import fsa.training.tutormatch.repository.*;
import fsa.training.tutormatch.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/test")
@CrossOrigin(origins = "*")
public class TestDataController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private ApplicationSubjectFeeRepository applicationSubjectFeeRepository;

    @Autowired
    private TeachingAudienceRepository teachingAudienceRepository;

    @Autowired
    private ApplicationTeachingAudienceRepository applicationTeachingAudienceRepository;

    @PostMapping("/generate-tutors")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateTutors(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> tutorsData = (List<Map<String, Object>>) request.get("tutors");
            Integer count = (Integer) request.get("count");

            if (tutorsData == null || tutorsData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không có dữ liệu gia sư"));
            }

            int createdCount = 0;
            List<String> errors = new ArrayList<>();

            for (Map<String, Object> tutorData : tutorsData) {
                try {
                    // Create user using UserService.createUser method
                    String firstName = (String) tutorData.get("firstName");
                    String lastName = (String) tutorData.get("lastName");
                    String email = (String) tutorData.get("email");
                    String password = (String) tutorData.get("password");
                    
                    User user = userService.createUser(email, email, password, firstName, lastName, UserRole.TUTOR);
                    if (user == null) {
                        errors.add("Không thể tạo user: " + email);
                        continue;
                    }

                    // Update additional user fields
                    user.setPhoneNumber((String) tutorData.get("phoneNumber"));
                    user.setAddress((String) tutorData.get("address"));
                    user.setGender(Gender.valueOf((String) tutorData.get("gender")));
                    user.setDateOfBirth(LocalDate.parse((String) tutorData.get("dateOfBirth")));
                    user.setEducationLevel(EducationLevel.valueOf((String) tutorData.get("educationLevel")));
                    user = userService.save(user);

                    // Create tutor profile
                    TutorProfile tutorProfile = new TutorProfile();
                    tutorProfile.setUser(user);
                    tutorProfile.setHeadline((String) tutorData.get("headline"));
                    tutorProfile.setBio((String) tutorData.get("bio"));
                    tutorProfile.setExperience((String) tutorData.get("experience"));
                    tutorProfile.setCity((String) tutorData.get("address"));
                    tutorProfile.setIsActive(true);
                    tutorProfile.setVerified(true);

                    tutorProfile = tutorProfileRepository.save(tutorProfile);

                    // Add subjects and fees
                    @SuppressWarnings("unchecked")
                    List<String> subjects = (List<String>) tutorData.get("subjects");
                    @SuppressWarnings("unchecked")
                    Map<String, Integer> hourlyRates = (Map<String, Integer>) tutorData.get("hourlyRates");

                    if (subjects != null && hourlyRates != null) {
                        for (String subjectName : subjects) {
                            // Find or create subject
                            Subject subject = subjectRepository.findByName(subjectName);
                            if (subject == null) {
                                subject = new Subject();
                                subject.setName(subjectName);
                                subject = subjectRepository.save(subject);
                            }

                            // Create subject fee
                            ApplicationSubjectFee subjectFee = new ApplicationSubjectFee();
                            subjectFee.setTutorProfile(tutorProfile);
                            subjectFee.setSubject(subject);
                            subjectFee.setFees(BigDecimal.valueOf(hourlyRates.get(subjectName)));
                            applicationSubjectFeeRepository.save(subjectFee);
                        }
                    }

                    // Add teaching audiences (default to all)
                    List<TeachingAudience> allAudiences = teachingAudienceRepository.findAll();
                    for (TeachingAudience audience : allAudiences) {
                        ApplicationTeachingAudience tutorAudience = new ApplicationTeachingAudience();
                        tutorAudience.setTutorProfile(tutorProfile);
                        tutorAudience.setTeachingAudience(audience);
                        applicationTeachingAudienceRepository.save(tutorAudience);
                    }

                    createdCount++;

                } catch (Exception e) {
                    errors.add("Lỗi tạo gia sư " + tutorData.get("email") + ": " + e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requestedCount", count);
            response.put("createdCount", createdCount);
            response.put("errors", errors);
            response.put("message", String.format("Đã tạo thành công %d/%d gia sư", createdCount, count));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/clear-test-data")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> clearTestData() {
        try {
            // Delete test users (those with @test.com email)
            List<User> testUsers = userRepository.findByEmailContaining("@test.com");
            int deletedCount = 0;

            for (User user : testUsers) {
                // Delete related data first
                Optional<TutorProfile> tutorProfileOpt = user.getTutorProfile();
                if (tutorProfileOpt.isPresent()) {
                    TutorProfile profile = tutorProfileOpt.get();
                    
                    // Delete subject fees
                    applicationSubjectFeeRepository.deleteByTutorProfile(profile);
                    
                    // Delete teaching audiences
                    applicationTeachingAudienceRepository.deleteByTutorProfile(profile);
                    
                    // Delete tutor profile
                    tutorProfileRepository.delete(profile);
                }
                
                // Delete user
                userRepository.delete(user);
                deletedCount++;
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", String.format("Đã xóa %d gia sư test", deletedCount),
                "deletedCount", deletedCount
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/test-data-stats")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTestDataStats() {
        try {
            List<User> testUsers = userRepository.findByEmailContaining("@test.com");
            List<User> allTutors = userRepository.findByRole(UserRole.TUTOR);

            Map<String, Object> stats = new HashMap<>();
            stats.put("testTutorsCount", testUsers.size());
            stats.put("totalTutorsCount", allTutors.size());
            stats.put("testTutorsPercentage", allTutors.size() > 0 ? 
                (double) testUsers.size() / allTutors.size() * 100 : 0);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }
}
