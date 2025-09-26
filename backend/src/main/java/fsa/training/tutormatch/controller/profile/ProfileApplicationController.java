package fsa.training.tutormatch.controller.profile;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.dto.BecomeTutorDraftRequest;
import fsa.training.tutormatch.dto.StudentProfileRequest;
import fsa.training.tutormatch.entity.ProfileApplication;
import fsa.training.tutormatch.entity.TeachingAudience;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.ApplicationStatus;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.repository.ProfileApplicationRepository;
import fsa.training.tutormatch.repository.TeachingAudienceRepository;
import fsa.training.tutormatch.service.ProfileApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
public class ProfileApplicationController {
    
    private final ProfileApplicationService applicationService;
    private final UserRepository userRepository;
    private final ProfileApplicationRepository applicationRepository;
    private final TeachingAudienceRepository teachingAudienceRepository;

    /**
     * Simple test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Backend is running!"
        ));
    }


    /**
     * Test save draft endpoint without authentication
     */
    @PostMapping("/test-save-draft")
    public ResponseEntity<?> testSaveDraftEndpoint(@RequestBody BecomeTutorDraftRequest request) {
        log.info("Test save draft request received: {}", request);
        log.info("Educations: {}", request.getEducations());
        log.info("Certificates: {}", request.getCertificates());
        log.info("TeachingAudiences: {}", request.getTeachingAudiences());
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Draft saved successfully (test mode)",
            "data", request
        ));
    }

    /**
     * Create teaching audiences data (test endpoint)
     */
    @PostMapping("/test-create-teaching-audiences")
    public ResponseEntity<?> createTeachingAudiences() {
        try {
            // Create teaching audiences if they don't exist
            String[] audiences = {
                "INDEPENDENT_LEARNER",
                "MIDDLE_SCHOOL", 
                "HIGH_SCHOOL",
                "VOCATIONAL_SCHOOL",
                "COLLEGE_UNIVERSITY",
                "POSTGRADUATE",
                "WORKING_PROFESSIONAL"
            };
            
            for (String audienceName : audiences) {
                if (!teachingAudienceRepository.findByName(audienceName).isPresent()) {
                    TeachingAudience audience = new TeachingAudience();
                    audience.setName(audienceName);
                    teachingAudienceRepository.save(audience);
                    log.info("Created teaching audience: {}", audienceName);
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Teaching audiences created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating teaching audiences: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Test submit application endpoint without authentication
     */
    @PostMapping("/test-submit")
    public ResponseEntity<?> testSubmitEndpoint(@RequestBody BecomeTutorRequest request) {
        log.info("Test submit application request received: {}", request);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Application submitted successfully (test mode)",
            "data", request
        ));
    }

    /**
     * Save tutor application draft
     */
    @PostMapping("/tutor/draft")
    @PreAuthorize("permitAll()") // Tạm thời disable authentication để debug
    public ResponseEntity<?> saveTutorDraft(@RequestBody BecomeTutorDraftRequest request, Authentication authentication) {
        try {
            // Tạm thời sử dụng username mặc định để test
            String username = authentication != null ? authentication.getName() : "testuser@example.com";
            log.info("Saving draft for user: {}", username);
            log.info("Request data: {}", request);
            Map<String, Object> result = applicationService.saveDraftForStudentBecomingTutor(username, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error saving tutor draft: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Submit tutor application for review
     */
    @PostMapping("/tutor/submit")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<?> submitTutorApplication(@RequestBody BecomeTutorRequest request, Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> result = applicationService.submitApplicationForStudentBecomingTutor(username, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error submitting tutor application: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get draft application data
     */
    @GetMapping("/tutor/draft")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<?> getDraftApplicationData(Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> result = applicationService.getDraftApplicationData(username);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error getting draft application data: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Admin: Get applications for review
     */
    @GetMapping("/admin/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getApplicationsForReview(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<Map<String, Object>> applications = applicationService.getApplicationsForAdminReview();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "applications", applications
            ));
        } catch (Exception e) {
            log.error("Error getting applications for review: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Admin: Approve application
     */
    @PostMapping("/admin/approve/{applicationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveApplication(
            @PathVariable Long applicationId,
            @RequestParam(required = false) String note,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            Map<String, Object> result = applicationService.approveApplication(applicationId, adminUsername);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error approving application: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Admin: Reject application
     */
    @PostMapping("/admin/reject/{applicationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long applicationId,
            @RequestParam String reason,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            Map<String, Object> result = applicationService.rejectApplication(applicationId, adminUsername, reason);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error rejecting application: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    // ===== TEST ENDPOINTS (NO AUTHENTICATION) =====
    @GetMapping("/test-draft")
    public ResponseEntity<Map<String, Object>> getTestDraftData() {
        log.info("Received test draft data request");
        
        // Return test data with schedules and images
        Map<String, Object> testData = new HashMap<>();
        testData.put("success", true);
        testData.put("hasDraft", true);
        testData.put("firstName", "Test User");
        testData.put("lastName", "Frontend Test");
        testData.put("phoneNumber", "1234567890");
        testData.put("address", "Test Address");
        testData.put("timezone", "Asia/Ho_Chi_Minh");
        testData.put("bio", "Test bio for frontend");
        testData.put("headline", "Test headline");
        testData.put("experience", "Test experience");
        testData.put("teachingLevel", "MIDDLE_SCHOOL");
        testData.put("imageAvatar", "https://example.com/avatar.jpg");
        testData.put("cvFileUrl", "https://example.com/cv.pdf");
        testData.put("videoIntro", "https://youtube.com/watch?v=test");
        testData.put("teachingMethods", "[\"MIDDLE_SCHOOL\", \"HIGH_SCHOOL\"]");
        testData.put("educations", List.of());
        testData.put("certificates", List.of());
        testData.put("schedules", List.of(
            Map.of(
                "dayOfWeek", "WEDNESDAY",
                "fromTime", "09:00",
                "toTime", "10:30",
                "enable", true
            ),
            Map.of(
                "dayOfWeek", "THURSDAY", 
                "fromTime", "14:00",
                "toTime", "15:30",
                "enable", true
            )
        ));
        testData.put("subjectFees", List.of());
        
        return ResponseEntity.ok(testData);
    }

    /**
     * Test endpoint to create a real application
     */
    @PostMapping("/test-create-application")
    public ResponseEntity<?> testCreateApplication() {
        try {
            // Find the test user
            User user = userRepository.findByUsername("testuser@example.com")
                    .orElseThrow(() -> new RuntimeException("Test user not found"));

            // Create a test application
            ProfileApplication application = new ProfileApplication();
            application.setUser(user);
            application.setStatus(ApplicationStatus.SUBMITTED);
            application.setFirstName("Test");
            application.setLastName("User");
            application.setPhoneNumber("1234567890");
            application.setAddress("Test Address");
            application.setBio("Test bio for approval");
            application.setHeadline("Test headline for approval");
            application.setExperience("Test experience for approval");
            application.setCvFileUrl("https://example.com/cv.pdf");
            application.setCvFileName("cv.pdf");
            application.setVideoIntro("https://youtube.com/watch?v=test");
            application.setSubmittedAt(ZonedDateTime.now());
            
            applicationRepository.save(application);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test application created successfully",
                "applicationId", application.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    // ===== STUDENT PROFILE APPLICATION ENDPOINTS =====
    // TODO: Implement later
    /*
    @PostMapping("/student/draft")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> saveStudentDraft(Authentication authentication, @RequestBody StudentProfileRequest request) {
        log.info("Received saveStudentDraft request from user: {}", authentication.getName());
        Map<String, Object> result = applicationService.saveDraftForStudentProfileUpdate(authentication.getName(), request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/student/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitStudentApplication(Authentication authentication, @RequestBody StudentProfileRequest request) {
        log.info("Received submitStudentApplication request from user: {}", authentication.getName());
        Map<String, Object> result = applicationService.submitStudentProfileUpdateApplication(authentication.getName(), request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/student/draft")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyStudentDraft(Authentication authentication) {
        log.info("Received getMyStudentDraft request from user: {}", authentication.getName());
        Map<String, Object> result = applicationService.getStudentApplicationData(authentication.getName());
        return ResponseEntity.ok(result);
    }
    */
}
