package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.BookingType;
import fsa.training.tutormatch.service.BookingValidationService;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Objects;

@Service
public class BookingValidationServiceImpl implements BookingValidationService {
    
    @Override
    public void validateBookingRequest(BookingRequestCreateDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request cannot be null");
        }
        
        if (request.getTutorId() == null || request.getTutorId() <= 0) {
            throw new IllegalArgumentException("Invalid tutor ID");
        }
        
        if (request.getSubjectId() == null || request.getSubjectId() <= 0) {
            throw new IllegalArgumentException("Invalid subject ID");
        }
        
        validateTimeSlot(request.getTime());
        validateBookingType(request.getBookingType());
        
        if ("CONTRACT".equals(request.getBookingType()) || 
            request.getBookingType().startsWith("CONTRACT")) {
            validateContractDetails(request);
        }
    }
    
    @Override
    public void validateTimeSlot(String timeSlot) {
        if (timeSlot == null || timeSlot.trim().isEmpty()) {
            throw new IllegalArgumentException("Time slot cannot be empty");
        }
        
        String[] timeRange = timeSlot.split("-");
        if (timeRange.length != 2) {
            throw new IllegalArgumentException("Invalid time format. Expected: HH:mm-HH:mm");
        }
        
        try {
            LocalTime startTime = LocalTime.parse(timeRange[0]);
            LocalTime endTime = LocalTime.parse(timeRange[1]);
            
            if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
                throw new IllegalArgumentException("End time must be after start time");
            }
            
            if (java.time.Duration.between(startTime, endTime).toMinutes() < 30) {
                throw new IllegalArgumentException("Minimum booking duration is 30 minutes");
            }
            
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid time format: " + e.getMessage());
        }
    }
    
    @Override
    public void validateBookingOwnership(Booking booking, User user) {
        if (booking == null || user == null) {
            throw new IllegalArgumentException("Booking and user cannot be null");
        }
        
        boolean isOwner = Objects.equals(booking.getStudent().getId(), user.getId()) ||
                         Objects.equals(booking.getTutor().getId(), user.getId());
        
        if (!isOwner) {
            throw new IllegalArgumentException("Unauthorized access to booking");
        }
    }
    
    @Override
    public void validateBookingStatusForAction(Booking booking, String action) {
        if (booking == null || action == null) {
            throw new IllegalArgumentException("Booking and action cannot be null");
        }
        
        switch (action.toLowerCase()) {
            case "accept":
            case "reject":
                if (booking.getStatus() != BookingStatus.PENDING) {
                    throw new IllegalArgumentException("Can only accept/reject pending bookings");
                }
                break;
            case "cancel":
                if (booking.getStatus() == BookingStatus.COMPLETED) {
                    throw new IllegalArgumentException("Cannot cancel completed bookings");
                }
                break;
            case "complete":
                if (booking.getStatus() != BookingStatus.CONFIRMED) {
                    throw new IllegalArgumentException("Can only complete confirmed bookings");
                }
                break;
            default:
                throw new IllegalArgumentException("Unknown action: " + action);
        }
    }
    
    @Override
    public boolean canAcceptBooking(Booking booking, User tutor) {
        return booking != null && 
               tutor != null &&
               Objects.equals(booking.getTutor().getId(), tutor.getId()) &&
               booking.getStatus() == BookingStatus.PENDING;
    }
    
    @Override
    public boolean canCancelBooking(Booking booking, User student) {
        return booking != null &&
               student != null &&
               Objects.equals(booking.getStudent().getId(), student.getId()) &&
               booking.getStatus() == BookingStatus.PENDING;
    }
    
    @Override
    public boolean isTimeSlotAvailable(User tutor, String date, String timeSlot) {
        // TODO: Implement time slot availability check
        // This would check against tutor's schedule and existing bookings
        return true; // Placeholder
    }
    
    private void validateBookingType(String bookingType) {
        if (bookingType == null || bookingType.trim().isEmpty()) {
            throw new IllegalArgumentException("Booking type cannot be empty");
        }
        
        try {
            BookingType.valueOf(bookingType);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid booking type: " + bookingType);
        }
    }
    
    private void validateContractDetails(BookingRequestCreateDTO request) {
        if (request.getContractDuration() == null || request.getContractDuration() <= 0) {
            throw new IllegalArgumentException("Contract duration must be positive");
        }
        
        if (request.getSessionsPerWeek() == null || request.getSessionsPerWeek() <= 0) {
            throw new IllegalArgumentException("Sessions per week must be positive");
        }
        
        if (request.getTotalAmount() == null || request.getTotalAmount() <= 0) {
            throw new IllegalArgumentException("Total amount must be positive");
        }
    }
} 