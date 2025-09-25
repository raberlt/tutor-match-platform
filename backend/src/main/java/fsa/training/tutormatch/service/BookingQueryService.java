package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Booking;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingQueryService {
    
    // Find operations
    Optional<Booking> findById(Integer bookingId);
    List<Booking> findByStudent(String studentUsername);
    List<Booking> findByTutor(String tutorUsername);
    
    // Status-based queries
    List<Booking> getPendingBookings(String tutorUsername);
    List<Booking> getConfirmedBookings(String tutorUsername);
    List<Booking> getCancelledBookings(String username);
    
    // LocalDate-based queries
    List<Booking> getConfirmedBookingsByLocalDate(String tutorUsername, LocalDate date);
    List<Booking> getBookingsBetweenLocalDates(String tutorUsername, LocalDate startLocalDate, LocalDate endLocalDate);
    
    // Statistics queries
    long countPendingBookings(String tutorUsername);
    long countCompletedBookings(String tutorUsername);
    long countTodayBookings(String tutorUsername);
} 