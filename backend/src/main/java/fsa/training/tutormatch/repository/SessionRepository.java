package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Session;
import fsa.training.tutormatch.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    
    // Find sessions by booking
    List<Session> findByBooking(Booking booking);
    
    // Find sessions by booking ID
    List<Session> findByBookingId(Integer bookingId);
    
    // Find sessions by status
    List<Session> findByStatus(SessionStatus status);
    
    // Find sessions by date range
    List<Session> findBySessionDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find sessions by booking and status
    List<Session> findByBookingAndStatus(Booking booking, SessionStatus status);
    
    // Find sessions by date
    List<Session> findBySessionDate(LocalDate sessionDate);
    
    // Custom query to find upcoming sessions
    @Query("SELECT s FROM Session s WHERE s.sessionDate >= :currentDate AND s.status = 'SCHEDULED' ORDER BY s.sessionDate, s.startTime")
    List<Session> findUpcomingSessions(@Param("currentDate") LocalDate currentDate);
    
    // Custom query to find sessions by tutor and date range
    @Query("SELECT s FROM Session s JOIN s.booking b WHERE b.tutor.id = :tutorId AND s.sessionDate BETWEEN :startDate AND :endDate ORDER BY s.sessionDate, s.startTime")
    List<Session> findByTutorAndDateRange(@Param("tutorId") Integer tutorId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Custom query to find sessions by student and date range
    @Query("SELECT s FROM Session s JOIN s.booking b WHERE b.student.id = :studentId AND s.sessionDate BETWEEN :startDate AND :endDate ORDER BY s.sessionDate, s.startTime")
    List<Session> findByStudentAndDateRange(@Param("studentId") Integer studentId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
