package fsa.training.tutormatch.service.interfaces;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.BookingType;
public interface IBookingValidationService {
    
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