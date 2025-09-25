package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.BookingType;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.SubjectRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.BookingCreationService;
import fsa.training.tutormatch.service.BookingValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class BookingCreationServiceImpl implements BookingCreationService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private BookingValidationService validationService;
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createTrialBooking(String studentUsername, BookingRequestCreateDTO request) {
        validationService.validateBookingRequest(request);
        
        Booking booking = createBaseBooking(studentUsername, request);
        booking.setBookingType(BookingType.SINGLE);
        
        return bookingRepository.save(booking);
    }
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createMonthlyBooking(String studentUsername, BookingRequestCreateDTO request) {
        validationService.validateBookingRequest(request);
        
        Booking booking = createBaseBooking(studentUsername, request);
        booking.setBookingType(BookingType.SINGLE);
        
        return bookingRepository.save(booking);
    }
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createContractBooking(String studentUsername, BookingRequestCreateDTO request) {
        validationService.validateBookingRequest(request);
        
        Booking booking = createBaseBooking(studentUsername, request);
        
        // Set contract-specific details
        booking.setBookingType(BookingType.PACKAGE);
        if (request.getContractDuration() != null) {
            if (request.getContractDuration() != 3 && request.getContractDuration() != 6) {
                throw new IllegalArgumentException("Contract duration must be 3 or 6 months");
            }
        }
        
        booking.setContractDuration(request.getContractDuration());
        booking.setSessionsPerWeek(request.getSessionsPerWeek());
        booking.setTotalAmount(request.getTotalAmount());
        
        return bookingRepository.save(booking);
    }
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createBooking(String studentUsername, BookingRequestCreateDTO request) {
        // Factory method pattern - delegate to specific creation methods
        String bookingType = request.getBookingType().toUpperCase();
        
        switch (bookingType) {
            case "SINGLE":
                return createTrialBooking(studentUsername, request);
            case "MONTHLY":
                return createMonthlyBooking(studentUsername, request);
            case "CONTRACT":
            case "CONTRACT_3":
            case "CONTRACT_6":
                return createContractBooking(studentUsername, request);
            default:
                throw new IllegalArgumentException("Unknown booking type: " + bookingType);
        }
    }

    private Booking createBaseBooking(String studentUsername, BookingRequestCreateDTO request) {
        // Get entities
        User studentUser = findUserByUsername(studentUsername);
        User tutorUser = findUserById(request.getTutorId());
        Subject subject = findSubjectById(request.getSubjectId());

        // StudentProfile removed - use User directly
        TutorProfile tutorProfile = tutorUser.getTutorProfile()
                .orElseThrow(() -> new IllegalArgumentException("User không phải là tutor hợp lệ"));

        // Parse time
        String[] timeRange = request.getTime().split("-");
        LocalTime fromLocalTime = LocalTime.parse(timeRange[0] + ":00");
        LocalTime toLocalTime = LocalTime.parse(timeRange[1] + ":00");
        LocalDate bookingDate = LocalDate.parse(request.getDate());

        // Create booking
        Booking booking = new Booking();
        booking.setStudent(studentUser);
        booking.setTutor(tutorProfile);
        booking.setSubject(subject);
        booking.setDate(bookingDate);
        booking.setFromTime(fromLocalTime);
        booking.setToTime(toLocalTime);
        booking.setNote(request.getNote());
        booking.setStatus(BookingStatus.PENDING);

        return booking;
    }


    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
    
    private User findUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
    
    private Subject findSubjectById(Integer subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));
    }
} 
 
 