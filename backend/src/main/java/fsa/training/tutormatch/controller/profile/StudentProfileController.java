package fsa.training.tutormatch.controller.profile;

import fsa.training.tutormatch.dto.StudentProfileRequest;
import fsa.training.tutormatch.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/profile")
@RequiredArgsConstructor
@Slf4j
public class StudentProfileController {
    
    private final StudentProfileService studentProfileService;

    /**
     * API lấy thông tin student profile hiện tại
     * GET /api/student/profile/my-profile
     */
    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyProfile(Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.info("Getting student profile data for user: {}", username);
            
            // Use the existing service method or create a new one specifically for student profile
            Map<String, Object> result = studentProfileService.getStudentProfileData(username);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error getting student profile data: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API lưu student profile
     * POST /api/student/profile/save
     */
    @PostMapping("/save")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> saveProfile(
            @RequestBody StudentProfileRequest request,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.info("Save student profile request from {}: {}", username, request);
            
            Map<String, Object> result = studentProfileService.saveStudentProfileDraft(username, request);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error saving student profile: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API submit student profile for admin approval
     * POST /api/student/profile/submit
     */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitProfile(
            @RequestBody StudentProfileRequest request,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            log.info("Submit student profile request from {}: {}", username, request);
            
            Map<String, Object> result = studentProfileService.submitStudentProfile(username, request);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error submitting student profile: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}
