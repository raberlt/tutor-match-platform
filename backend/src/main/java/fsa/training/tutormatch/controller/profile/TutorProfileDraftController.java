package fsa.training.tutormatch.controller.profile;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.dto.BecomeTutorDraftRequest;
import fsa.training.tutormatch.service.TutorProfileDraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor/draft")
@RequiredArgsConstructor
@Slf4j
public class TutorProfileDraftController {
    
    private final TutorProfileDraftService draftService;

    /**
     * API lưu nháp cho Student
     * POST /api/tutor/draft/save
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveDraft(
            @RequestBody BecomeTutorDraftRequest request,
            Authentication authentication) {
        
        try {
            // Get username from authentication
            String username = authentication.getName();
            
            log.info("Draft save request received from {}: {}", username, request);
            
            Map<String, Object> result = draftService.saveDraftRequest(username, request);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error saving draft: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API gửi hồ sơ cho Student/Tutor
     * POST /api/tutor/draft/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitApplication(
            @RequestBody BecomeTutorDraftRequest request,
            Authentication authentication) {
        
        try {
            // Get username from authentication
            String username = authentication.getName();
            
            log.info("Submit application request received from {}: {}", username, request);
            
            Map<String, Object> result = draftService.submitDraftRequest(username, request);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error submitting application: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API admin duyệt hồ sơ Student
     * PUT /api/tutor/draft/{profileId}/approve-student
     */
    @PutMapping("/{profileId}/approve-student")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approveStudentApplication(
            @PathVariable Integer profileId,
            Authentication authentication) {
        
        try {
            String adminUsername = authentication.getName();
            Map<String, Object> result = draftService.approveStudentApplication(profileId, adminUsername);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error approving student application: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API admin duyệt cập nhật của Tutor
     * PUT /api/tutor/draft/{profileId}/approve-tutor
     */
    @PutMapping("/{profileId}/approve-tutor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approveTutorUpdate(
            @PathVariable Integer profileId,
            Authentication authentication) {
        
        try {
            String adminUsername = authentication.getName();
            Map<String, Object> result = draftService.approveTutorUpdate(profileId, adminUsername);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error approving tutor update: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API admin từ chối hồ sơ
     * PUT /api/tutor/draft/{profileId}/reject
     */
    @PutMapping("/{profileId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectApplication(
            @PathVariable Integer profileId,
            @RequestBody Map<String, String> requestBody,
            Authentication authentication) {
        
        try {
            String adminUsername = authentication.getName();
            String rejectReason = requestBody.get("rejectReason");
            
            if (rejectReason == null || rejectReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Vui lòng nhập lý do từ chối!"
                ));
            }
            
            // TODO: Implement reject logic
            Map<String, Object> result = Map.of(
                "success", true,
                "message", "Đã từ chối hồ sơ!",
                "profileId", profileId,
                "rejectReason", rejectReason
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error rejecting application: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API lấy thông tin draft hiện tại của user để load dữ liệu cho form 8 bước
     * GET /api/tutor/draft/my-draft
     */
    @GetMapping("/my-draft")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<Map<String, Object>> getMyDraft(Authentication authentication) {
        
        try {
            if (authentication == null) {
                log.error("Authentication is null");
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Authentication required"
                ));
            }
            
            String username = authentication.getName();
            log.info("Getting draft profile data for user: {}", username);
            
            if (username == null || username.trim().isEmpty()) {
                log.error("Username is null or empty");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid username"
                ));
            }
            
            Map<String, Object> result = draftService.getDraftProfileData(username);
            
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            log.error("Runtime error getting draft profile data: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error getting draft profile data: ", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error: " + e.getMessage()
            ));
        }
    }
}
