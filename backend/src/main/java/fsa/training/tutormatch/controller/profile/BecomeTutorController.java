package fsa.training.tutormatch.controller.profile;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.service.ProfileApplicationService;
import fsa.training.tutormatch.repository.TeachingAudienceRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/become-tutor")
@PreAuthorize("hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_TUTOR')")
public class BecomeTutorController {

    @Autowired
    private ProfileApplicationService profileApplicationService;
    
    @Autowired
    private TeachingAudienceRepository teachingAudienceRepository;

    /**
     * Lấy danh sách tất cả đối tượng dạy có sẵn
     */
    @GetMapping("/teaching-audiences")
    @CrossOrigin(origins = "*")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getAllTeachingAudiences() {
        try {
            // Trả về dữ liệu hardcode trước để test
            List<Map<String, Object>> audienceList = new ArrayList<>();
            
            String[] audiences = {
                "Học tự do",
                "Trung học cơ sở", 
                "Trung học phổ thông",
                "Trung cấp nghề",
                "Cao đẳng / Đại học",
                "Sau đại học",
                "Người đi làm"
            };
            
            for (int i = 0; i < audiences.length; i++) {
                Map<String, Object> audienceData = new HashMap<>();
                audienceData.put("id", i + 1);
                audienceData.put("name", audiences[i]);
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
     * Lấy danh sách tất cả môn học có sẵn
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
     * Kiểm tra trạng thái đăng ký của student
     */
    @GetMapping("/status")
    public ResponseEntity<?> getApplicationStatus(Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> response = profileApplicationService.getApplicationStatus(username);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi kiểm tra trạng thái: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy chi tiết đăng ký của student
     */
    @GetMapping("/details")
    public ResponseEntity<?> getApplicationDetails(Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> response = profileApplicationService.getApplicationDetails(username);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi lấy chi tiết đăng ký: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Gửi đăng ký làm tutor
     */
    @PostMapping("/apply")
    public ResponseEntity<?> submitTutorApplication(@Valid @RequestBody BecomeTutorRequest request,
                                                    Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> result = profileApplicationService.submitTutorApplication(username, request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đăng ký làm tutor đã được gửi thành công!");
            response.put("applicationId", result.get("applicationId"));
            response.put("status", result.get("status"));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi gửi đăng ký: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Hủy đăng ký làm tutor
     */
    @PutMapping("/cancel")
    @Transactional
    public ResponseEntity<?> cancelTutorApplication(Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> result = profileApplicationService.cancelTutorApplication(username);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi hủy đăng ký: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 