package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.Booking;

import java.sql.Date;
import java.util.List;

public interface IBookingService {
    
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
    List<Booking> getConfirmedBookingsByDate(String tutorUsername, Date date);
    List<Booking> getBookingsBetweenDates(String tutorUsername, Date startDate, Date endDate);
} 