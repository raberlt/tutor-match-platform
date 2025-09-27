package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.dto.SessionDTO;
import fsa.training.tutormatch.entity.Session;
import fsa.training.tutormatch.enums.SessionStatus;
import fsa.training.tutormatch.service.SessionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
@Slf4j
public class SessionController {
    
    @Autowired
    private SessionService sessionService;
    
    /**
     * Create a new session
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createSession(@RequestBody SessionDTO sessionDTO) {
        try {
            Session session = sessionService.createSession(sessionDTO);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Session created successfully");
            response.put("sessionId", session.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating session: ", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create session: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get sessions by booking ID
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getSessionsByBookingId(@PathVariable Integer bookingId) {
        try {
            List<Session> sessions = sessionService.getSessionsByBookingId(bookingId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sessions", sessions);
            response.put("totalSessions", sessions.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting sessions for booking ID {}: ", bookingId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get sessions: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Update session status
     */
    @PutMapping("/{sessionId}/status")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateSessionStatus(@PathVariable Long sessionId, @RequestParam SessionStatus status) {
        try {
            Session session = sessionService.updateSessionStatus(sessionId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Session status updated successfully");
            response.put("session", session);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating session status for ID {}: ", sessionId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update session status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get upcoming sessions
     */
    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getUpcomingSessions() {
        try {
            List<Session> sessions = sessionService.getUpcomingSessions();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sessions", sessions);
            response.put("totalSessions", sessions.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting upcoming sessions: ", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get upcoming sessions: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get sessions by date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getSessionsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        try {
            List<Session> sessions = sessionService.getSessionsByDateRange(startDate, endDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sessions", sessions);
            response.put("totalSessions", sessions.size());
            response.put("startDate", startDate);
            response.put("endDate", endDate);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting sessions by date range: ", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get sessions by date range: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Cancel a session
     */
    @PutMapping("/{sessionId}/cancel")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelSession(@PathVariable Long sessionId, @RequestParam(required = false) String reason) {
        try {
            Session session = sessionService.cancelSession(sessionId, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Session cancelled successfully");
            response.put("session", session);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error cancelling session ID {}: ", sessionId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to cancel session: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Complete a session
     */
    @PutMapping("/{sessionId}/complete")
    @PreAuthorize("hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> completeSession(@PathVariable Long sessionId) {
        try {
            Session session = sessionService.completeSession(sessionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Session completed successfully");
            response.put("session", session);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error completing session ID {}: ", sessionId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to complete session: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
