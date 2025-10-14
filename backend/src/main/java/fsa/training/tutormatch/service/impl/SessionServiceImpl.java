package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.dto.SessionDTO;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Session;
import fsa.training.tutormatch.enums.SessionStatus;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.SessionRepository;
import fsa.training.tutormatch.service.SessionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@Slf4j
public class SessionServiceImpl implements SessionService {
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Override
    @Transactional
    public Session createSession(SessionDTO sessionDTO) {
        log.info("Creating session for booking ID: {}", sessionDTO.getBookingId());
        
        Session session = new Session();
        session.setSessionDate(sessionDTO.getSessionDate());
        session.setStartTime(sessionDTO.getStartTime());
        session.setEndTime(sessionDTO.getEndTime());
        session.setStatus(sessionDTO.getStatus() != null ? sessionDTO.getStatus() : SessionStatus.PAYMENT_PENDING);
        
        // Set booking reference
        if (sessionDTO.getBookingId() != null) {
            Booking booking = bookingRepository.findById(sessionDTO.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + sessionDTO.getBookingId()));
            session.setBooking(booking);
        }
        
        Session savedSession = sessionRepository.save(session);
        log.info("Session created successfully with ID: {}", savedSession.getId());
        
        return savedSession;
    }
    
    @Override
    @Transactional
    public List<Session> createSessionsForBooking(Booking booking, List<SessionDTO> sessionDTOs) {
        log.info("Creating {} sessions for booking ID: {}", sessionDTOs.size(), booking.getId());
        
        List<Session> sessions = sessionDTOs.stream().map(sessionDTO -> {
            Session session = new Session();
            session.setBooking(booking);
            session.setSessionDate(sessionDTO.getSessionDate());
            session.setStartTime(sessionDTO.getStartTime());
            session.setEndTime(sessionDTO.getEndTime());
            session.setStatus(sessionDTO.getStatus() != null ? sessionDTO.getStatus() : SessionStatus.PAYMENT_PENDING);
            return session;
        }).toList();
        
        List<Session> savedSessions = sessionRepository.saveAll(sessions);
        log.info("Successfully created {} sessions for booking ID: {}", savedSessions.size(), booking.getId());
        
        return savedSessions;
    }
    
    @Override
    @Transactional
    public Session updateSessionStatus(Long sessionId, SessionStatus status) {
        log.info("Updating session ID: {} to status: {}", sessionId, status);
        
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found with ID: " + sessionId));
        
        session.setStatus(status);
        
        // Update reschedule count if status is RESCHEDULED
        if (status == SessionStatus.RESCHEDULED) {
            session.setRescheduleCount(session.getRescheduleCount() + 1);
        }
        
        Session updatedSession = sessionRepository.save(session);
        log.info("Session status updated successfully");
        
        return updatedSession;
    }
    
    @Override
    public List<Session> getSessionsByBookingId(Integer bookingId) {
        log.info("Getting sessions for booking ID: {}", bookingId);
        return sessionRepository.findByBookingId(bookingId);
    }
    
    @Override
    public List<Session> getSessionsByStatus(SessionStatus status) {
        log.info("Getting sessions with status: {}", status);
        return sessionRepository.findByStatus(status);
    }
    
    @Override
    public List<Session> getSessionsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Getting sessions between {} and {}", startDate, endDate);
        return sessionRepository.findBySessionDateBetween(startDate, endDate);
    }
    
    @Override
    public List<Session> getUpcomingSessions() {
        log.info("Getting upcoming sessions");
        return sessionRepository.findUpcomingSessions(LocalDate.now());
    }
    
    @Override
    public List<Session> getSessionsByTutorAndDateRange(Integer tutorId, LocalDate startDate, LocalDate endDate) {
        log.info("Getting sessions for tutor ID: {} between {} and {}", tutorId, startDate, endDate);
        return sessionRepository.findByTutorAndDateRange(tutorId, startDate, endDate);
    }
    
    @Override
    public List<Session> getSessionsByStudentAndDateRange(Integer studentId, LocalDate startDate, LocalDate endDate) {
        log.info("Getting sessions for student ID: {} between {} and {}", studentId, startDate, endDate);
        return sessionRepository.findByStudentAndDateRange(studentId, startDate, endDate);
    }
    
    @Override
    @Transactional
    public Session cancelSession(Long sessionId, String reason) {
        log.info("Cancelling session ID: {} with reason: {}", sessionId, reason);
        return updateSessionStatus(sessionId, SessionStatus.CANCELLED);
    }
    
    @Override
    @Transactional
    public Session completeSession(Long sessionId) {
        log.info("Completing session ID: {}", sessionId);
        return updateSessionStatus(sessionId, SessionStatus.COMPLETED);
    }
}
