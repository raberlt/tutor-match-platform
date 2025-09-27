package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.SessionDTO;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Session;
import fsa.training.tutormatch.enums.SessionStatus;

import java.time.LocalDate;
import java.util.List;

public interface SessionService {
    
    /**
     * Create a new session
     */
    Session createSession(SessionDTO sessionDTO);
    
    /**
     * Create multiple sessions for a booking
     */
    List<Session> createSessionsForBooking(Booking booking, List<SessionDTO> sessionDTOs);
    
    /**
     * Update session status
     */
    Session updateSessionStatus(Long sessionId, SessionStatus status);
    
    /**
     * Get sessions by booking ID
     */
    List<Session> getSessionsByBookingId(Integer bookingId);
    
    /**
     * Get sessions by status
     */
    List<Session> getSessionsByStatus(SessionStatus status);
    
    /**
     * Get sessions by date range
     */
    List<Session> getSessionsByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Get upcoming sessions
     */
    List<Session> getUpcomingSessions();
    
    /**
     * Get sessions by tutor and date range
     */
    List<Session> getSessionsByTutorAndDateRange(Integer tutorId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Get sessions by student and date range
     */
    List<Session> getSessionsByStudentAndDateRange(Integer studentId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Cancel a session
     */
    Session cancelSession(Long sessionId, String reason);
    
    /**
     * Complete a session
     */
    Session completeSession(Long sessionId);
}
