package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.entity.Booking;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

public interface IBookingQueryService {
    
    // Find operations
    Optional<Booking> findById(Integer bookingId);
    List<Booking> findByStudent(String studentUsername);
    List<Booking> findByTutor(String tutorUsername);
    
    // Status-based queries
    List<Booking> getPendingBookings(String tutorUsername);
    List<Booking> getConfirmedBookings(String tutorUsername);
    List<Booking> getCancelledBookings(String username);
    
    // Date-based queries
    List<Booking> getConfirmedBookingsByDate(String tutorUsername, Date date);
    List<Booking> getBookingsBetweenDates(String tutorUsername, Date startDate, Date endDate);
    
    // Statistics queries
    long countPendingBookings(String tutorUsername);
    long countCompletedBookings(String tutorUsername);
    long countTodayBookings(String tutorUsername);
} 