package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.Booking;

public interface BookingCreationService {
    Booking createTrialBooking(String studentUsername, BookingRequestCreateDTO request);
    Booking createMonthlyBooking(String studentUsername, BookingRequestCreateDTO request);
    Booking createContractBooking(String studentUsername, BookingRequestCreateDTO request);
    Booking createBooking(String studentUsername, BookingRequestCreateDTO request);
}
