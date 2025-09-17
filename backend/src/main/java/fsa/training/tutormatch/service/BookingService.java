package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.ContractRepository;
import fsa.training.tutormatch.repository.StudentProfileRepository;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ContractRepository contractRepository;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private TutorProfileRepository tutorProfileRepository;
    
    /**
     * Tạo booking mới dựa trên loại booking
     */
    public Booking createBooking(CreateBookingRequest request) {
        // Validate input
        validateBookingRequest(request);
        
        // Get student and tutor profiles
        StudentProfile student = studentProfileRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        TutorProfile tutor = tutorProfileRepository.findById(request.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        
        // Create booking
        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setTutor(tutor);
        booking.setSubject(request.getSubject());
        booking.setDate(request.getDate());
        booking.setFromTime(request.getFromTime());
        booking.setToTime(request.getToTime());
        booking.setTime(request.getTime());
        booking.setBookingType(request.getBookingType());
        booking.setNote(request.getNote());
        booking.setAmount(request.getAmount());
        booking.setContractDuration(request.getContractDuration());
        booking.setSessionsPerWeek(request.getSessionsPerWeek());
        
        // Set status based on booking type
        switch (request.getBookingType()) {
            case TRIAL:
            case SINGLE_SESSION:
                // Thanh toán → Auto chấp nhận
                booking.setStatus(BookingStatus.PAYMENT_PENDING);
                break;
            case PACKAGE:
                // Chọn lịch → Chờ giảng viên chấp nhận
                booking.setStatus(BookingStatus.PENDING);
                break;
        }
        
        // Save booking
        Booking savedBooking = bookingRepository.save(booking);
        
        // Create contract for package booking
        if (request.getBookingType() == BookingType.PACKAGE) {
            createContract(savedBooking, request);
        }
        
        return savedBooking;
    }
    
    /**
     * Xử lý thanh toán cho booking
     */
    public Booking processPayment(Integer bookingId, PaymentRequest paymentRequest) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Validate payment
        if (booking.getStatus() != BookingStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Booking is not in payment pending status");
        }
        
        // Process payment (simulate payment gateway)
        boolean paymentSuccess = processPaymentGateway(paymentRequest);
        
        if (paymentSuccess) {
            booking.setPaymentStatus(Booking.PaymentStatus.COMPLETED);
            booking.setPaymentMethod(paymentRequest.getPaymentMethod());
            booking.setPaymentReference(paymentRequest.getPaymentReference());
            booking.setPaymentDate(java.sql.Timestamp.valueOf(LocalDateTime.now()));
            
            // Auto approve for trial and single session
            if (booking.getBookingType() == BookingType.TRIAL || 
                booking.getBookingType() == BookingType.SINGLE_SESSION) {
                booking.setStatus(BookingStatus.TUTOR_APPROVED);
            } else {
                booking.setStatus(BookingStatus.PAYMENT_COMPLETED);
            }
        } else {
            booking.setPaymentStatus(Booking.PaymentStatus.FAILED);
        }
        
        return bookingRepository.save(booking);
    }
    
    /**
     * Giảng viên chấp nhận booking (chỉ cho package)
     */
    public Booking tutorApproveBooking(Integer bookingId, String tutorNote) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getBookingType() != BookingType.PACKAGE) {
            throw new RuntimeException("Only package bookings require tutor approval");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }
        
        booking.setStatus(BookingStatus.TUTOR_APPROVED);
        booking.setNote(tutorNote);
        
        return bookingRepository.save(booking);
    }
    
    /**
     * Giảng viên từ chối booking
     */
    public Booking tutorRejectBooking(Integer bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(BookingStatus.TUTOR_REJECTED);
        booking.setNote(reason);
        
        return bookingRepository.save(booking);
    }
    
    /**
     * Tạo hợp đồng cho package booking
     */
    private void createContract(Booking booking, CreateBookingRequest request) {
        Contract contract = new Contract();
        contract.setBooking(booking);
        contract.setContractNumber(generateContractNumber());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setTotalSessions(request.getTotalSessions());
        contract.setMonthlyFee(request.getMonthlyFee());
        contract.setTotalAmount(request.getAmount());
        contract.setTermsAndConditions(request.getTermsAndConditions());
        contract.setNotes(request.getContractNotes());
        
        contractRepository.save(contract);
    }
    
    /**
     * Lấy danh sách booking theo student
     */
    public List<Booking> getBookingsByStudent(Integer studentId) {
        return bookingRepository.findByStudentId(studentId);
    }
    
    /**
     * Lấy danh sách booking theo tutor
     */
    public List<Booking> getBookingsByTutor(Integer tutorId) {
        return bookingRepository.findByTutorId(tutorId);
    }
    
    /**
     * Lấy booking theo ID
     */
    public Optional<Booking> getBookingById(Integer id) {
        return bookingRepository.findById(id);
    }
    
    // Helper methods
    private void validateBookingRequest(CreateBookingRequest request) {
        if (request.getStudentId() == null || request.getTutorId() == null) {
            throw new RuntimeException("Student ID and Tutor ID are required");
        }
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Valid amount is required");
        }
        if (request.getBookingType() == BookingType.PACKAGE) {
            if (request.getStartDate() == null || request.getEndDate() == null) {
                throw new RuntimeException("Start date and end date are required for package booking");
            }
            if (request.getTotalSessions() == null || request.getTotalSessions() <= 0) {
                throw new RuntimeException("Total sessions is required for package booking");
            }
        }
    }
    
    private boolean processPaymentGateway(PaymentRequest paymentRequest) {
        // Simulate payment gateway processing
        // In real implementation, integrate with payment gateway
        return true; // Always return true for demo
    }
    
    private String generateContractNumber() {
        return "CONTRACT-" + System.currentTimeMillis();
    }
    
    // DTOs
    public static class CreateBookingRequest {
        private Integer studentId;
        private Integer tutorId;
        private Subject subject;
        private java.sql.Date date;
        private java.sql.Time fromTime;
        private java.sql.Time toTime;
        private String time;
        private BookingType bookingType;
        private String note;
        private Double amount;
        private Integer contractDuration;
        private Integer sessionsPerWeek;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer totalSessions;
        private Double monthlyFee;
        private String termsAndConditions;
        private String contractNotes;
        
        // Getters and setters
        public Integer getStudentId() { return studentId; }
        public void setStudentId(Integer studentId) { this.studentId = studentId; }
        public Integer getTutorId() { return tutorId; }
        public void setTutorId(Integer tutorId) { this.tutorId = tutorId; }
        public Subject getSubject() { return subject; }
        public void setSubject(Subject subject) { this.subject = subject; }
        public java.sql.Date getDate() { return date; }
        public void setDate(java.sql.Date date) { this.date = date; }
        public java.sql.Time getFromTime() { return fromTime; }
        public void setFromTime(java.sql.Time fromTime) { this.fromTime = fromTime; }
        public java.sql.Time getToTime() { return toTime; }
        public void setToTime(java.sql.Time toTime) { this.toTime = toTime; }
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public BookingType getBookingType() { return bookingType; }
        public void setBookingType(BookingType bookingType) { this.bookingType = bookingType; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public Integer getContractDuration() { return contractDuration; }
        public void setContractDuration(Integer contractDuration) { this.contractDuration = contractDuration; }
        public Integer getSessionsPerWeek() { return sessionsPerWeek; }
        public void setSessionsPerWeek(Integer sessionsPerWeek) { this.sessionsPerWeek = sessionsPerWeek; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public Integer getTotalSessions() { return totalSessions; }
        public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }
        public Double getMonthlyFee() { return monthlyFee; }
        public void setMonthlyFee(Double monthlyFee) { this.monthlyFee = monthlyFee; }
        public String getTermsAndConditions() { return termsAndConditions; }
        public void setTermsAndConditions(String termsAndConditions) { this.termsAndConditions = termsAndConditions; }
        public String getContractNotes() { return contractNotes; }
        public void setContractNotes(String contractNotes) { this.contractNotes = contractNotes; }
    }
    
    /**
     * Cập nhật booking
     */
    public Booking updateBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
    
    /**
     * Lấy tất cả booking
     */
    public List<Booking> findAllBookings() {
        return bookingRepository.findAll();
    }
    
    /**
     * Xóa booking
     */
    public void deleteBooking(Booking booking) {
        bookingRepository.delete(booking);
    }
    
    public static class PaymentRequest {
        private String paymentMethod;
        private String paymentReference;
        private String cardNumber;
        private String expiryDate;
        private String cvv;
        
        // Getters and setters
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getPaymentReference() { return paymentReference; }
        public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
        public String getCardNumber() { return cardNumber; }
        public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
        public String getExpiryDate() { return expiryDate; }
        public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }
        public String getCvv() { return cvv; }
        public void setCvv(String cvv) { this.cvv = cvv; }
    }
}
