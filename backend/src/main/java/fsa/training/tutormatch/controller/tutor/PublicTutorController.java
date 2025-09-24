package fsa.training.tutormatch.controller.tutor;

import fsa.training.tutormatch.dto.TutorPreviewDTO;
import fsa.training.tutormatch.entity.Subject;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.TutorProfileSubject;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.ProfileStatus;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.SubjectRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.interfaces.ITutorService;
import fsa.training.tutormatch.service.interfaces.ITutorApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicTutorController {

    @Autowired
    private ITutorService tutorService;
    
    @Autowired
    private ITutorApplicationService tutorApplicationService;
    
    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * API công khai cho Guest - Tìm kiếm gia sư với pagination và filters
     * Không cần authentication
     */
    @GetMapping("/tutors")
    public ResponseEntity<?> searchTutorPreviews(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer subjectId,
            @RequestParam(required = false) BigDecimal minFee,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            Map<String, Object> result = (Map<String, Object>) tutorService.searchTutorPreviewsWithFilters(
                keyword, subjectId, minFee, maxFee, minRating, city,
                page, size, sortBy, sortDirection);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi tìm kiếm gia sư: " + e.getMessage())
            );
        }
    }

    /**
     * API công khai - Lấy danh sách môn học
     * Không cần authentication
     */
    @GetMapping("/subjects")
    public ResponseEntity<?> getAllSubjects() {
        try {
            List<Subject> subjects = tutorApplicationService.getAllAvailableSubjects();
            List<Map<String, Object>> subjectList = new ArrayList<>();
            
            for (Subject subject : subjects) {
                Map<String, Object> subjectData = new HashMap<>();
                subjectData.put("id", subject.getId());
                subjectData.put("name", subject.getName());
                subjectList.add(subjectData);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("subjects", subjectList);
            response.put("total", subjectList.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi lấy danh sách môn học: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * API công khai - Test database connection
     */
    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            // Test if we can query profiles
            List<Subject> subjects = tutorApplicationService.getAllAvailableSubjects();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "subjects_count", subjects.size(),
                "message", "Database connection working"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API công khai - Create test tutor data
     */
    @PostMapping("/create-test-tutors")
    public ResponseEntity<?> createTestTutors() {
        try {
            // Find or create a tutor user
            User tutorUser = userRepository.findByUsername("tutor@example.com").orElse(null);
            if (tutorUser == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Tutor user not found. Please create user with username 'tutor@example.com'"
                ));
            }

            // Get subjects
            List<Subject> subjects = subjectRepository.findAll();
            if (subjects.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "No subjects found"
                ));
            }

            // Create tutor profile
            TutorProfile profile = new TutorProfile();
            profile.setUser(tutorUser);
            profile.setBio("Experienced tutor with 5 years of experience");
            profile.setHeadline("Professional Math Tutor");
            profile.setExperience("5 years of tutoring experience");
            profile.setTeachingLevel("HIGH_SCHOOL");
            profile.setCvUrl("https://example.com/cv.pdf");
            profile.setVideoIntro("https://example.com/video.mp4");
            profile.setProfileStatus(ProfileStatus.ACTIVE);
            profile.setDraft(false);
            profile.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
            profile.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

            TutorProfile savedProfile = profileRepository.save(profile);

            // Create profile subjects
            TutorProfileSubject mathSubject = new TutorProfileSubject();
            mathSubject.setProfile(savedProfile);
            mathSubject.setSubject(subjects.get(0)); // First subject (Math)
            mathSubject.setFees(150000);
            mathSubject.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
            mathSubject.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

            TutorProfileSubject physicsSubject = new TutorProfileSubject();
            physicsSubject.setProfile(savedProfile);
            physicsSubject.setSubject(subjects.get(1)); // Second subject (Physics)
            physicsSubject.setFees(200000);
            physicsSubject.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
            physicsSubject.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

            // Save profile subjects
            List<TutorProfileSubject> profileSubjects = new ArrayList<>();
            profileSubjects.add(mathSubject);
            profileSubjects.add(physicsSubject);
            savedProfile.setProfileSubjects(profileSubjects);
            profileRepository.save(savedProfile);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test tutor created successfully",
                "profile_id", savedProfile.getId(),
                "subjects_count", profileSubjects.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Error creating test tutor: " + e.getMessage()
            ));
        }
    }

    /**
     * API công khai - Thông tin cơ bản về hệ thống
     */
    @GetMapping("/info")
    public ResponseEntity<?> getSystemInfo() {
        return ResponseEntity.ok(
            new SystemInfo(
                "TutorMatch - Hệ thống kết nối gia sư",
                "Đăng ký để xem chi tiết gia sư và đặt lịch học",
                "v1.0"
            )
        );
    }

    // Nested DTO for system info
    public record SystemInfo(String name, String description, String version) {}
} 