package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.Booking;

public interface BookingCreationService {
    Booking createSingleBooking(String studentUsername, BookingRequestCreateDTO request);
    Booking createPackageBooking(String studentUsername, BookingRequestCreateDTO request);
    Booking createBooking(String studentUsername, BookingRequestCreateDTO request);
}
