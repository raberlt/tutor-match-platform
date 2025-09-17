package fsa.training.tutormatch.controller.api.student;

import fsa.training.tutormatch.dto.BecomeTutorRequest;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.service.interfaces.ITutorApplicationService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/become-tutor")
@PreAuthorize("hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_TUTOR')")
public class StudentBecomeTutorController {

    @Autowired
    private ITutorApplicationService tutorApplicationService;

    /**
     * Lấy danh sách tất cả môn học có sẵn
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
     * Kiểm tra trạng thái đăng ký của student
     */
    @GetMapping("/status")
    public ResponseEntity<?> getApplicationStatus(Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> response = tutorApplicationService.getApplicationStatus(username);
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
            Map<String, Object> response = tutorApplicationService.getApplicationDetails(username);
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
            BaseProfile profile = tutorApplicationService.submitTutorApplication(username, request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đăng ký làm tutor đã được gửi thành công!");
            response.put("profileId", profile.getId());
            response.put("status", profile.getProfileStatus().toString());

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
            boolean cancelled = tutorApplicationService.cancelTutorApplication(username);
            
            if (cancelled) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Đã hủy đăng ký làm tutor thành công!");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy đăng ký để hủy");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi hủy đăng ký: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 