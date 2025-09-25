package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.Booking;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    
    // Booking creation
    Booking createBooking(String studentUsername, Integer tutorId, Integer subjectId, 
                         String date, String time, String note);
    Booking createBooking(String studentUsername, BookingRequestCreateDTO request);
    
    // Booking status management  
    Booking acceptBooking(Integer bookingId, String tutorUsername);
    Booking rejectBooking(Integer bookingId, String tutorUsername);
    Booking cancelBookingByStudent(Integer bookingId, String studentUsername);
    
    // Booking queries
    List<Booking> getPendingBookings(String tutorUsername);
    List<Booking> getConfirmedBookingsByLocalDate(String tutorUsername, LocalDate date);
    List<Booking> getBookingsBetweenLocalDates(String tutorUsername, LocalDate startLocalDate, LocalDate endLocalDate);
} 