package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.BookingType;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    // Methods với User và TutorProfile
    Page<Booking> findByStudent(User student, Pageable pageable);
    Page<Booking> findByStudentAndStatus(User student, BookingStatus status, Pageable pageable);
    Page<Booking> findByTutor(TutorProfile tutor, Pageable pageable);
    Page<Booking> findByTutorAndStatus(TutorProfile tutor, BookingStatus status, Pageable pageable);
    List<Booking> findByTutorAndStatus(TutorProfile tutor, BookingStatus status);
    
    // Methods với User để backward compatibility
    @Query("SELECT b FROM Booking b WHERE b.student = :user")
    Page<Booking> findByStudentUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.student = :user AND b.status = :status")
    Page<Booking> findByStudentUserAndStatus(@Param("user") User user, @Param("status") BookingStatus status, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.tutor.user = :user")
    Page<Booking> findByTutorUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.tutor.user = :user AND b.status = :status")
    Page<Booking> findByTutorUserAndStatus(@Param("user") User user, @Param("status") BookingStatus status, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.tutor.user = :user AND b.status = :status")
    List<Booking> findByTutorUserAndStatus(@Param("user") User user, @Param("status") BookingStatus status);
    
    // Basic find methods
    List<Booking> findByStudentId(Integer studentId);
    List<Booking> findByTutorId(Integer tutorId);
    
    // Admin pagination methods
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);
    
    // Count methods for statistics
    long countByStatus(BookingStatus status);
    long countByBookingType(BookingType bookingType);
    long countByCreatedAtAfter(ZonedDateTime date);
    long countByTutor(TutorProfile tutor);
    long countByTutorAndStatus(TutorProfile tutor, BookingStatus status);
    long countByStudent(User student);
    long countByStudentAndStatus(User student, BookingStatus status);
    
    // Additional methods for student controller
    List<Booking> findByStudentAndStatus(User student, BookingStatus status);
} 