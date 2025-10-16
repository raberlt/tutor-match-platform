package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.service.BookingCreationService;
import fsa.training.tutormatch.service.BookingQueryService;
import fsa.training.tutormatch.service.BookingService;
import fsa.training.tutormatch.service.BookingStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingCreationService creationService;

    @Autowired
    private BookingStatusService statusService;

    @Autowired
    private BookingQueryService queryService;

    /**
     * Tạo booking mới (simple version - backward compatibility)
     */
    @Override
    public Booking createBooking(String studentUsername, Integer tutorId, Integer subjectId, 
                               String date, String time, String note) {
        BookingRequestCreateDTO request = new BookingRequestCreateDTO();
        request.setTutorId(tutorId);
        request.setSubjectId(subjectId);
        request.setDate(date);
        // map sang fromTime/toTime cho API mới
        if (time != null && time.contains("-")) {
            String[] parts = time.split("-");
            request.setFromTime(parts[0]);
            request.setToTime(parts[1]);
        }
        request.setNote(note);
        request.setBookingType("SINGLE"); // Default to single
        
        return createBooking(studentUsername, request);
    }

    /**
     * Tạo booking với đầy đủ thông tin (trial, monthly, contract)
     * Facade pattern - delegate to specialized services
     */
    @Override
    public Booking createBooking(String studentUsername, BookingRequestCreateDTO request) {
        return creationService.createBooking(studentUsername, request);
    }

    /**
     * Accept booking request - Facade pattern
     */
    @Override
    public Booking acceptBooking(Integer bookingId, String tutorUsername) {
        return statusService.acceptBooking(bookingId, tutorUsername);
    }

    /**
     * Reject booking request - Facade pattern
     */
    @Override
    public Booking rejectBooking(Integer bookingId, String tutorUsername) {
        return statusService.rejectBooking(bookingId, tutorUsername);
    }

    /**
     * Cancel booking by student - Facade pattern
     */
    @Override
    public Booking cancelBookingByStudent(Integer bookingId, String studentUsername) {
        return statusService.cancelBookingByStudent(bookingId, studentUsername);
    }

    /**
     * Get pending bookings for tutor - Facade pattern
     */
    @Override
    public List<Booking> getPendingBookings(String tutorUsername) {
        return queryService.getPendingBookings(tutorUsername);
    }

    /**
     * Get confirmed bookings for tutor on specific date - Facade pattern
     */
    @Override
    public List<Booking> getConfirmedBookingsByLocalDate(String tutorUsername, LocalDate date) {
        return queryService.getConfirmedBookingsByLocalDate(tutorUsername, date);
    }

    /**
     * Get bookings between dates for statistics - Facade pattern
     */
    @Override
    public List<Booking> getBookingsBetweenLocalDates(String tutorUsername, LocalDate startLocalDate, LocalDate endLocalDate) {
        return queryService.getBookingsBetweenLocalDates(tutorUsername, startLocalDate, endLocalDate);
    }
} 