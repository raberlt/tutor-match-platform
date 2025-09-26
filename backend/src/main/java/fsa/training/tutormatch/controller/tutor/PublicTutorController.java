package fsa.training.tutormatch.controller.tutor;

import fsa.training.tutormatch.entity.Subject;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.TutorProfileSubject;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.TeachingAudience;
import fsa.training.tutormatch.entity.Schedule;
import fsa.training.tutormatch.entity.Education;
import fsa.training.tutormatch.entity.Certificate;
import fsa.training.tutormatch.repository.ProfileRepository;
import fsa.training.tutormatch.repository.SubjectRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.repository.TeachingAudienceRepository;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.service.TutorService;
import fsa.training.tutormatch.service.ProfileApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
@Slf4j
public class PublicTutorController {

    @Autowired
    private TutorService tutorService;
    
    @Autowired
    private ProfileApplicationService profileApplicationService;
    
    @Autowired
    private TeachingAudienceRepository teachingAudienceRepository;
    
    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private TutorProfileRepository tutorProfileRepository;
    
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
            List<Subject> subjects = profileApplicationService.getAllAvailableSubjects();
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
            List<Subject> subjects = profileApplicationService.getAllAvailableSubjects();
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
            // teachingLevel and draft fields removed
            profile.setCvFileUrl("https://example.com/cv.pdf");
            profile.setVideoIntro("https://example.com/video.mp4");
            profile.setEnable(true);
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

    /**
     * Lấy danh sách đối tượng dạy từ database
     */
    @GetMapping("/teaching-audiences")
    public ResponseEntity<?> getTeachingAudiences() {
        try {
            // Import TeachingAudienceRepository
            List<TeachingAudience> audiences = teachingAudienceRepository.findAll();
            List<Map<String, Object>> audienceList = new ArrayList<>();
            
            for (TeachingAudience audience : audiences) {
                Map<String, Object> audienceData = new HashMap<>();
                audienceData.put("id", audience.getId().intValue());
                audienceData.put("name", audience.getName());
                audienceList.add(audienceData);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("teachingAudiences", audienceList);
            response.put("total", audienceList.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi lấy danh sách đối tượng dạy: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Tạo đối tượng dạy mới (test endpoint)
     */
    @PostMapping("/teaching-audiences")
    public ResponseEntity<?> createTeachingAudience(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Name is required"
                ));
            }
            
            TeachingAudience audience = new TeachingAudience();
            audience.setName(name.trim());
            TeachingAudience saved = teachingAudienceRepository.save(audience);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Teaching audience created successfully",
                "audience", saved
            ));
        } catch (Exception e) {
            log.error("Error creating teaching audience: ", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to create teaching audience"
            ));
        }
    }

    /**
     * Lấy thông tin chi tiết gia sư theo username
     */
    @GetMapping("/tutors/username/{username}")
    public ResponseEntity<?> getTutorByUsername(@PathVariable String username) {
        try {
            // Tìm user theo username
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Tìm tutor profile theo user
            Optional<TutorProfile> tutorOpt = tutorProfileRepository.findByUser(user);
            
            if (tutorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            TutorProfile tutor = tutorOpt.get();
            
            // Kiểm tra xem tutor có được enable không
            if (!Boolean.TRUE.equals(tutor.getEnable())) {
                return ResponseEntity.notFound().build();
            }
            
            // Build response với đầy đủ thông tin
            Map<String, Object> response = new HashMap<>();
            response.put("id", tutor.getId());
            response.put("firstName", tutor.getFirstName());
            response.put("lastName", tutor.getLastName());
            response.put("imageAvatar", tutor.getImageAvatar());
            response.put("bio", tutor.getBio());
            response.put("headline", tutor.getHeadline());
            response.put("experience", tutor.getExperience());
            response.put("videoIntro", tutor.getVideoIntro());
            response.put("ratePointAverage", tutor.getRatePointAverage());
            response.put("totalPoint", tutor.getTotalPoint());
            response.put("cvFileUrl", tutor.getCvFileUrl());
            response.put("enable", tutor.getEnable());
            response.put("createdAt", tutor.getCreatedAt());
            response.put("updatedAt", tutor.getUpdatedAt());
            
            // User information
            if (tutor.getUser() != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", tutor.getUser().getId());
                userInfo.put("username", tutor.getUser().getUsername());
                userInfo.put("email", tutor.getUser().getEmail());
                userInfo.put("phoneNumber", tutor.getUser().getPhoneNumber());
                userInfo.put("address", tutor.getUser().getAddress());
                userInfo.put("isVerified", tutor.getUser().isVerified());
                userInfo.put("timezone", tutor.getUser().getTimezone());
                response.put("user", userInfo);
            }
            
            // Profile subjects
            if (tutor.getProfileSubjects() != null) {
                List<Map<String, Object>> subjects = new ArrayList<>();
                for (TutorProfileSubject profileSubject : tutor.getProfileSubjects()) {
                    Map<String, Object> subjectData = new HashMap<>();
                    subjectData.put("id", profileSubject.getId());
                    subjectData.put("fees", profileSubject.getFees());
                    subjectData.put("createdAt", profileSubject.getCreatedAt());
                    subjectData.put("updatedAt", profileSubject.getUpdatedAt());
                    
                    Map<String, Object> subjectInfo = new HashMap<>();
                    subjectInfo.put("id", profileSubject.getSubject().getId());
                    subjectInfo.put("name", profileSubject.getSubject().getName());
                    subjectInfo.put("description", profileSubject.getSubject().getDescription());
                    subjectData.put("subject", subjectInfo);
                    
                    subjects.add(subjectData);
                }
                response.put("profileSubjects", subjects);
            }
            
            // Schedules
            if (tutor.getSchedules() != null) {
                List<Map<String, Object>> schedules = new ArrayList<>();
                for (Schedule schedule : tutor.getSchedules()) {
                    Map<String, Object> scheduleData = new HashMap<>();
                    scheduleData.put("id", schedule.getId());
                    scheduleData.put("dayOfWeek", schedule.getDayOfWeek());
                    scheduleData.put("fromTime", schedule.getFromTime());
                    scheduleData.put("toTime", schedule.getToTime());
                    scheduleData.put("enable", schedule.getEnable());
                    scheduleData.put("createdAt", schedule.getCreatedAt());
                    scheduleData.put("updatedAt", schedule.getUpdatedAt());
                    schedules.add(scheduleData);
                }
                response.put("schedules", schedules);
            }
            
            // Educations
            if (tutor.getEducations() != null) {
                List<Map<String, Object>> educations = new ArrayList<>();
                for (Education education : tutor.getEducations()) {
                    Map<String, Object> educationData = new HashMap<>();
                    educationData.put("id", education.getId());
                    educationData.put("schoolName", education.getSchoolName());
                    educationData.put("degree", education.getDegree());
                    educationData.put("major", education.getMajor());
                    educationData.put("fromTime", education.getFromTime());
                    educationData.put("toTime", education.getToTime());
                    educationData.put("degreeFileName", education.getDegreeFileName());
                    educationData.put("degreeFileUrl", education.getDegreeFileUrl());
                    educationData.put("valid", education.getValid());
                    educationData.put("isVerified", education.isVerified());
                    educationData.put("createdAt", education.getCreatedAt());
                    educationData.put("updatedAt", education.getUpdatedAt());
                    educations.add(educationData);
                }
                response.put("educations", educations);
            }
            
            // Teaching audiences
            if (tutor.getTeachingAudiences() != null) {
                List<Map<String, Object>> audiences = new ArrayList<>();
                for (TeachingAudience audience : tutor.getTeachingAudiences()) {
                    Map<String, Object> audienceData = new HashMap<>();
                    audienceData.put("id", audience.getId());
                    audienceData.put("name", audience.getName());
                    audienceData.put("createdAt", audience.getCreatedAt());
                    audienceData.put("updatedAt", audience.getUpdatedAt());
                    audiences.add(audienceData);
                }
                response.put("teachingAudiences", audiences);
            }
            
            // Certificates
            if (tutor.getCertificates() != null) {
                List<Map<String, Object>> certificates = new ArrayList<>();
                for (Certificate certificate : tutor.getCertificates()) {
                    Map<String, Object> certificateData = new HashMap<>();
                    certificateData.put("id", certificate.getId());
                    certificateData.put("name", certificate.getName());
                    certificateData.put("issuedBy", certificate.getIssuedBy());
                    certificateData.put("description", certificate.getDescription());
                    certificateData.put("certFileName", certificate.getCertFileName());
                    certificateData.put("certFileUrl", certificate.getCertFileUrl());
                    certificateData.put("valid", certificate.getValid());
                    certificateData.put("isVerified", certificate.isVerified());
                    certificateData.put("createdAt", certificate.getCreatedAt());
                    certificateData.put("updatedAt", certificate.getUpdatedAt());
                    certificates.add(certificateData);
                }
                response.put("certificates", certificates);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching tutor details for username {}: ", username, e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch tutor details: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy thông tin chi tiết gia sư theo ID
     */
    @GetMapping("/tutors/{id}")
    public ResponseEntity<?> getTutorById(@PathVariable Integer id) {
        try {
            Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(id);
            
            if (tutorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            TutorProfile tutor = tutorOpt.get();
            
            // Kiểm tra xem tutor có được enable không
            if (!Boolean.TRUE.equals(tutor.getEnable())) {
                return ResponseEntity.notFound().build();
            }
            
            // Build response với đầy đủ thông tin
            Map<String, Object> response = new HashMap<>();
            response.put("id", tutor.getId());
            response.put("firstName", tutor.getFirstName());
            response.put("lastName", tutor.getLastName());
            response.put("imageAvatar", tutor.getImageAvatar());
            response.put("bio", tutor.getBio());
            response.put("headline", tutor.getHeadline());
            response.put("experience", tutor.getExperience());
            response.put("videoIntro", tutor.getVideoIntro());
            response.put("ratePointAverage", tutor.getRatePointAverage());
            response.put("totalPoint", tutor.getTotalPoint());
            response.put("cvFileUrl", tutor.getCvFileUrl());
            response.put("enable", tutor.getEnable());
            response.put("createdAt", tutor.getCreatedAt());
            response.put("updatedAt", tutor.getUpdatedAt());
            
            // User information
            if (tutor.getUser() != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", tutor.getUser().getId());
                userInfo.put("username", tutor.getUser().getUsername());
                userInfo.put("email", tutor.getUser().getEmail());
                userInfo.put("phoneNumber", tutor.getUser().getPhoneNumber());
                userInfo.put("address", tutor.getUser().getAddress());
                userInfo.put("isVerified", tutor.getUser().isVerified());
                userInfo.put("timezone", tutor.getUser().getTimezone());
                response.put("user", userInfo);
            }
            
            // Profile subjects
            if (tutor.getProfileSubjects() != null) {
                List<Map<String, Object>> subjects = new ArrayList<>();
                for (TutorProfileSubject profileSubject : tutor.getProfileSubjects()) {
                    Map<String, Object> subjectData = new HashMap<>();
                    subjectData.put("id", profileSubject.getId());
                    subjectData.put("fees", profileSubject.getFees());
                    subjectData.put("createdAt", profileSubject.getCreatedAt());
                    subjectData.put("updatedAt", profileSubject.getUpdatedAt());
                    
                    Map<String, Object> subjectInfo = new HashMap<>();
                    subjectInfo.put("id", profileSubject.getSubject().getId());
                    subjectInfo.put("name", profileSubject.getSubject().getName());
                    subjectInfo.put("description", profileSubject.getSubject().getDescription());
                    subjectData.put("subject", subjectInfo);
                    
                    subjects.add(subjectData);
                }
                response.put("profileSubjects", subjects);
            }
            
            // Schedules
            if (tutor.getSchedules() != null) {
                List<Map<String, Object>> schedules = new ArrayList<>();
                for (Schedule schedule : tutor.getSchedules()) {
                    Map<String, Object> scheduleData = new HashMap<>();
                    scheduleData.put("id", schedule.getId());
                    scheduleData.put("dayOfWeek", schedule.getDayOfWeek());
                    scheduleData.put("fromTime", schedule.getFromTime());
                    scheduleData.put("toTime", schedule.getToTime());
                    scheduleData.put("enable", schedule.getEnable());
                    scheduleData.put("createdAt", schedule.getCreatedAt());
                    scheduleData.put("updatedAt", schedule.getUpdatedAt());
                    schedules.add(scheduleData);
                }
                response.put("schedules", schedules);
            }
            
            // Educations
            if (tutor.getEducations() != null) {
                List<Map<String, Object>> educations = new ArrayList<>();
                for (Education education : tutor.getEducations()) {
                    Map<String, Object> educationData = new HashMap<>();
                    educationData.put("id", education.getId());
                    educationData.put("schoolName", education.getSchoolName());
                    educationData.put("degree", education.getDegree());
                    educationData.put("major", education.getMajor());
                    educationData.put("fromTime", education.getFromTime());
                    educationData.put("toTime", education.getToTime());
                    educationData.put("degreeFileName", education.getDegreeFileName());
                    educationData.put("degreeFileUrl", education.getDegreeFileUrl());
                    educationData.put("valid", education.getValid());
                    educationData.put("isVerified", education.isVerified());
                    educationData.put("createdAt", education.getCreatedAt());
                    educationData.put("updatedAt", education.getUpdatedAt());
                    educations.add(educationData);
                }
                response.put("educations", educations);
            }
            
            // Teaching audiences
            if (tutor.getTeachingAudiences() != null) {
                List<Map<String, Object>> audiences = new ArrayList<>();
                for (TeachingAudience audience : tutor.getTeachingAudiences()) {
                    Map<String, Object> audienceData = new HashMap<>();
                    audienceData.put("id", audience.getId());
                    audienceData.put("name", audience.getName());
                    audienceData.put("createdAt", audience.getCreatedAt());
                    audienceData.put("updatedAt", audience.getUpdatedAt());
                    audiences.add(audienceData);
                }
                response.put("teachingAudiences", audiences);
            }
            
            // Certificates
            if (tutor.getCertificates() != null) {
                List<Map<String, Object>> certificates = new ArrayList<>();
                for (Certificate certificate : tutor.getCertificates()) {
                    Map<String, Object> certificateData = new HashMap<>();
                    certificateData.put("id", certificate.getId());
                    certificateData.put("name", certificate.getName());
                    certificateData.put("issuedBy", certificate.getIssuedBy());
                    certificateData.put("description", certificate.getDescription());
                    certificateData.put("certFileName", certificate.getCertFileName());
                    certificateData.put("certFileUrl", certificate.getCertFileUrl());
                    certificateData.put("valid", certificate.getValid());
                    certificateData.put("isVerified", certificate.isVerified());
                    certificateData.put("createdAt", certificate.getCreatedAt());
                    certificateData.put("updatedAt", certificate.getUpdatedAt());
                    certificates.add(certificateData);
                }
                response.put("certificates", certificates);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching tutor details for ID {}: ", id, e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch tutor details: " + e.getMessage()
            ));
        }
    }



    // Nested DTO for system info
    public record SystemInfo(String name, String description, String version) {}
} 