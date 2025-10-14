package fsa.training.tutormatch.controller.session;

import fsa.training.tutormatch.entity.SessionChangeHistory;
import fsa.training.tutormatch.repository.SessionChangeHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:5173")
public class SessionChangeHistoryController {

    @Autowired
    private SessionChangeHistoryRepository sessionChangeHistoryRepository;

    /**
     * Get change history for a specific session
     */
    @GetMapping("/{sessionId}/change-history")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSessionChangeHistory(@PathVariable Long sessionId) {
        try {
            List<SessionChangeHistory> changeHistory = sessionChangeHistoryRepository.findBySessionIdOrderByChangedAtDesc(sessionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", changeHistory);
            response.put("totalChanges", changeHistory.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Không thể tải lịch sử thay đổi: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get reschedule count for a specific session
     */
    @GetMapping("/{sessionId}/reschedule-count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSessionRescheduleCount(@PathVariable Long sessionId) {
        try {
            long rescheduleCount = sessionChangeHistoryRepository.countBySessionId(sessionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sessionId", sessionId);
            response.put("rescheduleCount", rescheduleCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Không thể đếm số lần đổi lịch: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
