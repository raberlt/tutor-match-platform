package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.BookingStatusService;
import fsa.training.tutormatch.service.BookingValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingStatusServiceImpl implements BookingStatusService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingValidationService validationService;
    
    @Override
    @PreAuthorize("hasRole('TUTOR')")
    @Transactional
    public Booking acceptBooking(Integer bookingId, String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        Booking booking = findBookingById(bookingId);
        
        // Validate ownership and status
        validationService.validateBookingOwnership(booking, tutor);
        validationService.validateBookingStatusForAction(booking, "accept");
        
        // Business rule check
        if (!validationService.canAcceptBooking(booking, tutor)) {
            throw new IllegalArgumentException("Cannot accept this booking");
        }
        
        // Update status -> tutor approved
        booking.setStatus(BookingStatus.TUTOR_ACCEPTED);
        // Nếu là gói học, set deadline thanh toán 24h
        try {
            if (booking.getBookingType() != null && String.valueOf(booking.getBookingType()).equals("PACKAGE")) {
                booking.setPaymentDeadline(java.time.ZonedDateTime.now().plusHours(24));
            }
        } catch (Exception ignored) {}
        
        return bookingRepository.save(booking);
    }
    
    @Override
    @PreAuthorize("hasRole('TUTOR')")
    @Transactional
    public Booking rejectBooking(Integer bookingId, String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        Booking booking = findBookingById(bookingId);
        
        // Validate ownership and status
        validationService.validateBookingOwnership(booking, tutor);
        validationService.validateBookingStatusForAction(booking, "reject");
        
        // Update status
        booking.setStatus(BookingStatus.CANCELLED);
        
        return bookingRepository.save(booking);
    }
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking cancelBookingByStudent(Integer bookingId, String studentUsername) {
        User student = findUserByUsername(studentUsername);
        Booking booking = findBookingById(bookingId);
        
        // Validate ownership and status
        validationService.validateBookingOwnership(booking, student);
        validationService.validateBookingStatusForAction(booking, "cancel");
        
        // Business rule check
        if (!validationService.canCancelBooking(booking, student)) {
            throw new IllegalArgumentException("Cannot cancel this booking");
        }
        
        // Update status
        booking.setStatus(BookingStatus.CANCELLED);
        
        return bookingRepository.save(booking);
    }
    
    @Override
    @PreAuthorize("hasRole('TUTOR')")
    @Transactional
    public Booking markBookingCompleted(Integer bookingId, String tutorUsername) {
        User tutor = findUserByUsername(tutorUsername);
        Booking booking = findBookingById(bookingId);
        
        // Validate ownership and status
        validationService.validateBookingOwnership(booking, tutor);
        validationService.validateBookingStatusForAction(booking, "complete");
        
        // Update status
        booking.setStatus(BookingStatus.TUTOR_ACCEPTED);
        
        return bookingRepository.save(booking);
    }
    
    @Override
    public boolean canTransitionStatus(Booking booking, BookingStatus newStatus, String username) {
        if (booking == null || newStatus == null || username == null) {
            return false;
        }
        
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return false;
        }
        
        BookingStatus currentStatus = booking.getStatus();
        
        // Define valid status transitions
        switch (currentStatus) {
            case PAYMENT_PENDING:
                return newStatus == BookingStatus.PAYMENT_COMPLETED || newStatus == BookingStatus.CANCELLED;
            case PAYMENT_COMPLETED:
                return newStatus == BookingStatus.TUTOR_ACCEPTED || newStatus == BookingStatus.CANCELLED;
            case TUTOR_ACCEPTED:
                return newStatus == BookingStatus.TUTOR_ACCEPTED || newStatus == BookingStatus.CANCELLED;
            case TUTOR_REJECTED:
                return false; // No transitions from rejected
            case REFUNDED:
                return false; // No transitions from refunded
            case CANCELLED:
                return false; // No transitions from cancelled
            default:
                return false;
        }
    }
    
    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
    
    private Booking findBookingById(Integer bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
    }
} 
 
 