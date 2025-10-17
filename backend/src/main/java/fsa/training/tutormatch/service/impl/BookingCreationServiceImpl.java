package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.BookingType;
import fsa.training.tutormatch.enums.PaymentStatus;
import fsa.training.tutormatch.enums.SessionStatus;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.SessionRepository;
import fsa.training.tutormatch.repository.SubjectRepository;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.BookingCreationService;
import fsa.training.tutormatch.service.BookingValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Service
public class BookingCreationServiceImpl implements BookingCreationService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TutorProfileRepository tutorProfileRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private BookingValidationService validationService;
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createSingleBooking(String studentUsername, BookingRequestCreateDTO request) {
        validationService.validateBookingRequest(request);
        
        Booking booking = createBaseBooking(studentUsername, request);
        booking.setBookingType(BookingType.SINGLE);
        booking.setStatus(BookingStatus.PAYMENT_PENDING);
        booking.setPaymentStatus(PaymentStatus.PENDING); // Single booking cần thanh toán ngay

        // single booking luôn có 1 session
        booking.setTotalSessions(1);
        // deadline thanh toán 10 phút
        booking.setPaymentDeadline(java.time.ZonedDateTime.now().plusMinutes(10));
        return bookingRepository.save(booking);
    }
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createPackageBooking(String studentUsername, BookingRequestCreateDTO request) {
        validationService.validateBookingRequest(request);
        
        Booking booking = createBaseBooking(studentUsername, request);
        
        // Set package-specific details
        booking.setBookingType(BookingType.PACKAGE);
        booking.setTotalSessions(request.getTotalSessions());
        booking.setTotalAmount(request.getTotalAmount());
        // Gói học chờ gia sư đồng ý trước khi thanh toán
        booking.setStatus(BookingStatus.AWAITING_TUTOR_ACCEPT);
        // paymentStatus sẽ là null cho đến khi gia sư đồng ý và chuyển sang TUTOR_ACCEPTED

        booking = bookingRepository.save(booking);

        // Tạo toàn bộ sessions từ request.sessions
        if (request.getSessions() != null && !request.getSessions().isEmpty()) {
            for (var s : request.getSessions()) {
                Session session = new Session();
                session.setBooking(booking);
                session.setSessionDate(java.time.LocalDate.parse(s.getDate()));
                session.setStartTime(java.time.LocalTime.parse(s.getFromTime() + ":00"));
                session.setEndTime(java.time.LocalTime.parse(s.getToTime() + ":00"));
                session.setStatus(SessionStatus.PAYMENT_PENDING);
                session.setRescheduleCount(0);
                try {
                    session.setSubject(findSubjectById(s.getSubjectId() != null ? s.getSubjectId() : request.getSubjectId()));
                } catch (Exception ignored) {}
                if (s.getFee() != null) {
                    session.setFee(s.getFee());
                }
                sessionRepository.save(session);
            }
        }

        return booking;
    }
    
    @Override
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public Booking createBooking(String studentUsername, BookingRequestCreateDTO request) {
        // Factory method pattern - delegate to specific creation methods
        String bookingType = request.getBookingType().toUpperCase();
        
        switch (bookingType) {
            case "SINGLE":
                return createSingleBooking(studentUsername, request);
            case "PACKAGE":
                return createPackageBooking(studentUsername, request);
            default:
                throw new IllegalArgumentException("Unknown booking type: " + bookingType);
        }
    }

    private Booking createBaseBooking(String studentUsername, BookingRequestCreateDTO request) {
        // Get entities
        User studentUser = findUserByUsername(studentUsername);
        Subject subject = findSubjectById(request.getSubjectId());

        System.out.println("=== DEBUG: Finding TutorProfile ===");
        System.out.println("Received tutorId: " + request.getTutorId());
        
        // Try to find TutorProfile by ID first (in case frontend sends TutorProfile.id)
        Optional<TutorProfile> tutorProfileOpt = tutorProfileRepository.findById(request.getTutorId());
        TutorProfile tutor = null;
        User tutorUser = null;
        
        if (tutorProfileOpt.isPresent()) {
            // Found TutorProfile by ID - get the associated User
            tutor = tutorProfileOpt.get();
            tutorUser = tutor.getUser();
            System.out.println("Found TutorProfile by ID: " + tutor.getId());
            System.out.println("Associated User ID: " + tutorUser.getId());
        } else {
            // Try to find User by ID (in case frontend sends User.id)
            try {
                tutorUser = findUserById(request.getTutorId());
                tutorProfileOpt = tutorProfileRepository.findByUser(tutorUser);
                if (tutorProfileOpt.isPresent()) {
                    tutor = tutorProfileOpt.get();
                    System.out.println("Found User by ID, then TutorProfile: " + tutor.getId());
                } else {
                    throw new IllegalArgumentException("User không phải là tutor hợp lệ");
                }
            } catch (Exception e) {
                throw new IllegalArgumentException("Không tìm thấy tutor với ID: " + request.getTutorId());
            }
        }
        
        System.out.println("Final TutorProfile ID: " + tutor.getId());
        System.out.println("Final TutorUser ID: " + tutorUser.getId());

        // Create booking
        Booking booking = new Booking();
        booking.setStudent(studentUser);
        booking.setTutor(tutor);
        booking.setNote(request.getNote());
        // Không set status ở đây - để createPackageBooking và createSingleBooking tự quyết định
        
        // Set financial fields - required for database constraints
        booking.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO);
        
        System.out.println("=== DEBUG: Booking financial fields ===");
        System.out.println("totalAmount: " + booking.getTotalAmount());

        // Lưu booking, KHÔNG tạo session ở đây (SINGLE tạo trong createSingleBooking, PACKAGE tạo từ request.sessions)
        return bookingRepository.save(booking);
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
 
 

