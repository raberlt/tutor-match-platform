package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;

public interface BookingStatusService {
    
    // Status transitions
    Booking acceptBooking(Integer bookingId, String tutorUsername);
    Booking rejectBooking(Integer bookingId, String tutorUsername);
    Booking cancelBookingByStudent(Integer bookingId, String studentUsername);
    Booking markBookingCompleted(Integer bookingId, String tutorUsername);
    
    // Status validation
    boolean canTransitionStatus(Booking booking, BookingStatus newStatus, String username);
} 