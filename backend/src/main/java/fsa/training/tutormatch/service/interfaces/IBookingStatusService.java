package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;

public interface IBookingStatusService {
    
    // Status transitions
    Booking acceptBooking(Integer bookingId, String tutorUsername);
    Booking rejectBooking(Integer bookingId, String tutorUsername);
    Booking cancelBookingByStudent(Integer bookingId, String studentUsername);
    Booking markBookingCompleted(Integer bookingId, String tutorUsername);
    
    // Status validation
    boolean canTransitionStatus(Booking booking, BookingStatus newStatus, String username);
} 