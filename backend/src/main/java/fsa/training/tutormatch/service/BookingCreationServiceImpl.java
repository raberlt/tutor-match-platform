package fsa.training.tutormatch.service;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.SubjectRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.interfaces.IBookingCreationService;
import fsa.training.tutormatch.service.interfaces.IBookingValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Time;

@Service
public class BookingCreationServiceImpl implements IBookingCreationService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private IBookingValidationService validationService;
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createTrialBooking(String studentUsername, BookingRequestCreateDTO request) {
        validationService.validateBookingRequest(request);
        
        Booking booking = createBaseBooking(studentUsername, request);
        booking.setBookingType(BookingType.TRIAL);
        
        return bookingRepository.save(booking);
    }
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createMonthlyBooking(String studentUsername, BookingRequestCreateDTO request) {
        validationService.validateBookingRequest(request);
        
        Booking booking = createBaseBooking(studentUsername, request);
        booking.setBookingType(BookingType.SINGLE_SESSION);
        
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
            case "TRIAL":
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

        // Lấy profile theo mô hình multi-profiles
        StudentProfile studentProfile = studentUser.getStudentProfile()
                .orElseThrow(() -> new IllegalArgumentException("User không phải là student hợp lệ"));
        TutorProfile tutorProfile = tutorUser.getTutorProfile()
                .orElseThrow(() -> new IllegalArgumentException("User không phải là tutor hợp lệ"));

        // Parse time
        String[] timeRange = request.getTime().split("-");
        Time fromTime = Time.valueOf(timeRange[0] + ":00");
        Time toTime = Time.valueOf(timeRange[1] + ":00");
        Date bookingDate = Date.valueOf(request.getDate());

        // Create booking
        Booking booking = new Booking();
        booking.setStudent(studentProfile);
        booking.setTutor(tutorProfile);
        booking.setSubject(subject);
        booking.setDate(bookingDate);
        booking.setFromTime(fromTime);
        booking.setToTime(toTime);
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
 
 