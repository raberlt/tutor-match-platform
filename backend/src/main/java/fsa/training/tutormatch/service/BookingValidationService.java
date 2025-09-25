package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.User;

public interface BookingValidationService {
    
    // Validation methods
    void validateBookingRequest(BookingRequestCreateDTO request);
    void validateTimeSlot(String timeSlot);
    void validateBookingOwnership(Booking booking, User user);
    void validateBookingStatusForAction(Booking booking, String action);
    
    // Business rule validation
    boolean canAcceptBooking(Booking booking, User tutor);
    boolean canCancelBooking(Booking booking, User student);
    boolean isTimeSlotAvailable(User tutor, String date, String timeSlot);
} 