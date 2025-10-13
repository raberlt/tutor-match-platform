package fsa.training.tutormatch.controller.booking;

import fsa.training.tutormatch.dto.BookingRequestCreateDTO;
import fsa.training.tutormatch.dto.BookingRequestDTO;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.BookingType;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.BookingService;
import fsa.training.tutormatch.service.PaymentService;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Lấy tất cả các loại booking
     */
    @GetMapping("/types")
    public ResponseEntity<List<BookingType>> getBookingTypes() {
        return ResponseEntity.ok(List.of(BookingType.values()));
    }

    /**
     * Lấy tất cả các trạng thái booking
     */
    @GetMapping("/statuses")
    public ResponseEntity<List<BookingStatus>> getBookingStatuses() {
        return ResponseEntity.ok(List.of(BookingStatus.values()));
    }

    /**
     * Thông tin về hệ thống booking
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getBookingSystemInfo() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("systemName", "TutorMatch Booking System");
        response.put("version", "2.0");
        response.put("features", new String[]{
            "3 loại booking: Học thử, Học buổi đơn, Học theo gói",
            "Học thử: Thanh toán → Auto chấp nhận",
            "Học buổi đơn: Thanh toán → Auto chấp nhận", 
            "Học theo gói: Chọn lịch → Giảng viên chấp nhận → Thanh toán",
            "Hợp đồng tự động cho học theo gói",
            "Quản lý trạng thái booking chi tiết"
        });
        
        response.put("bookingFlow", Map.of(
            "SINGLE", "Student → Payment → Auto Approve → Confirmed",            "PACKAGE", "Student → Select Schedule → Tutor Approve → Payment → Confirmed"
        ));
        
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    // ==================== STUDENT ENDPOINTS ====================

    /**
     * Tạo booking mới (Student) với tích hợp Payment
     */
    @PostMapping("/student/create")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createBookingForStudent(@RequestBody BookingRequestCreateDTO request, 
                                         Authentication authentication) {
        try {
            System.out.println("=== DEBUG: createBookingForStudent ===");
            System.out.println("Request: " + request);
            System.out.println("Authentication: " + authentication.getName());
            
            String username = authentication.getName();
            User student = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            System.out.println("Student found: " + student.getUsername());
            
            // Tạo booking
            Booking booking = bookingService.createBooking(username, request);
            System.out.println("Booking created: " + booking.getId());
            
            // Xử lý payment cho SINGLE_SESSION - tự động confirm
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đặt lịch thành công!");
            response.put("bookingId", booking.getId());
            response.put("status", booking.getStatus().name());
            
            // Cho SINGLE_SESSION, tự động confirm booking
            if (request.getBookingType().equals("SINGLE")) {
                // Nếu có payment method, xử lý payment
                if (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty()) {
                    try {
                        PaymentMethod paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
                        
                        // Tạo payment request (tạm thời comment out để tránh lỗi)
                        /*
                        PaymentService.PaymentRequest paymentRequest = new PaymentService.PaymentRequest();
                        paymentRequest.setBookingId(booking.getId());
                        paymentRequest.setStudentId(student.getId());
                        paymentRequest.setTutorId(booking.getTutor().getUser().getId());
                        paymentRequest.setAmount(request.getTotalAmount());
                        paymentRequest.setOriginalAmount(request.getTotalAmount());
                        paymentRequest.setPaymentMethod(paymentMethod);
                        paymentRequest.setDescription("Payment for booking #" + booking.getId());
                        paymentRequest.setCouponId(request.getCouponId());
                        
                        // Tạo payment
                        fsa.training.tutormatch.entity.Payment payment = paymentService.createPayment(paymentRequest);
                        
                        // Luôn yêu cầu thanh toán qua trang payment để đảm bảo flow chuẩn
                        response.put("paymentRequired", true);
                        response.put("paymentMethod", paymentMethod.name());
                        response.put("paymentId", payment.getId());
                        response.put("message", "Đặt lịch thành công! Vui lòng thanh toán để hoàn tất.");
                        */
                        
                        // Tạo payment record để có thể thanh toán sau
                        PaymentService.PaymentRequest paymentRequest = new PaymentService.PaymentRequest();
                        paymentRequest.setBookingId(booking.getId());
                        paymentRequest.setStudentId(student.getId());
                        paymentRequest.setTutorId(booking.getTutor().getUser().getId());
                        paymentRequest.setAmount(request.getTotalAmount());
                        paymentRequest.setOriginalAmount(request.getTotalAmount());
                        paymentRequest.setPaymentMethod(paymentMethod);
                        paymentRequest.setDescription("Payment for booking #" + booking.getId());
                        paymentRequest.setCouponId(request.getCouponId());
                        
                        // Tạo payment
                        fsa.training.tutormatch.entity.Payment payment = paymentService.createPayment(paymentRequest);
                        
                        // Yêu cầu thanh toán qua trang payment
                        response.put("paymentRequired", true);
                        response.put("paymentMethod", paymentMethod.name());
                        response.put("paymentId", payment.getId());
                        response.put("message", "Đặt lịch thành công! Vui lòng thanh toán để hoàn tất.");
                        
                        System.out.println("=== Payment Required Response ===");
                        System.out.println("bookingId: " + booking.getId());
                        System.out.println("paymentMethod: " + paymentMethod);
                        
                    } catch (IllegalArgumentException e) {
                        response.put("paymentError", "Phương thức thanh toán không hợp lệ: " + request.getPaymentMethod());
                    } catch (Exception e) {
                        response.put("paymentError", "Lỗi xử lý thanh toán: " + e.getMessage());
                    }
                } else {
                    // Không có payment method - tự động đánh dấu đã thanh toán
                    booking.setStatus(fsa.training.tutormatch.enums.BookingStatus.PAYMENT_COMPLETED);
                    booking.setPaymentStatus(fsa.training.tutormatch.enums.PaymentStatus.COMPLETED);
                    bookingRepository.save(booking);
                    
                    response.put("paymentCompleted", true);
                    response.put("message", "Đặt lịch thành công! Thanh toán đã hoàn tất.");
                    response.put("bookingStatus", booking.getStatus().name());
                }
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("=== ERROR in createBookingForStudent ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Đặt lịch thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy số dư tín dụng của student
     */
    @GetMapping("/student/credit-balance")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentCreditBalance(Authentication authentication) {
        try {
            String username = authentication.getName();
            User student = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // Tạm thời comment out để tránh lỗi
            // BigDecimal balance = creditService.getCurrentBalance(student);
            BigDecimal balance = student.getCreditBalance(); // Sử dụng trực tiếp từ User entity
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("balance", balance);
            response.put("currency", "VND");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi lấy số dư tín dụng: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy danh sách booking của student
     */
    @GetMapping("/student/my-bookings")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            System.out.println("=== getStudentBookings called ===");
            System.out.println("Page: " + page + ", Size: " + size + ", Status: " + status);
            
            String username = authentication.getName();
            System.out.println("Username: " + username);
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Booking> bookings;
            
            if (status != null && !status.isEmpty()) {
                // Map legacy statuses and guard against invalid values to avoid 500 errors
                String normalized = status.trim().toUpperCase();
                if ("PENDING".equals(normalized)) {
                    normalized = "PAYMENT_PENDING";
                } else if ("CONFIRMED".equals(normalized)) {
                    normalized = "PAYMENT_COMPLETED";
                }
                try {
                    BookingStatus bookingStatus = BookingStatus.valueOf(normalized);
                    bookings = bookingRepository.findByStudentAndStatus(user, bookingStatus, pageable);
                    System.out.println("Found bookings by status: " + bookings.getTotalElements());
                } catch (IllegalArgumentException ex) {
                    System.out.println("Unknown booking status '" + status + "', falling back to all bookings");
                    bookings = bookingRepository.findByStudent(user, pageable);
                }
            } else {
                bookings = bookingRepository.findByStudent(user, pageable);
                System.out.println("Found bookings for user: " + bookings.getTotalElements());
            }
            
            System.out.println("Bookings content size: " + bookings.getContent().size());
            
            List<BookingRequestDTO> bookingDTOs = bookings.getContent().stream()
                    .map(booking -> {
                        try {
                            System.out.println("Converting booking ID: " + booking.getId());
                            BookingRequestDTO dto = convertToDTO(booking);
                            System.out.println("Successfully converted booking ID: " + booking.getId());
                            return dto;
                        } catch (Exception e) {
                            System.err.println("Error converting booking ID " + booking.getId() + ": " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null) // Remove null DTOs
                    .collect(Collectors.toList());
                    
            System.out.println("Converted DTOs size: " + bookingDTOs.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", bookingDTOs); // Frontend expects 'content'
            response.put("bookings", bookingDTOs); // Keep for backward compatibility
            response.put("currentPage", bookings.getNumber());
            response.put("totalPages", bookings.getTotalPages());
            response.put("totalElements", bookings.getTotalElements());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy chi tiết booking của student
     */
    @GetMapping("/student/{bookingId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentBookingDetail(@PathVariable Integer bookingId,
                                            Authentication authentication) {
        try {
            String username = authentication.getName();
            User student = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Verify ownership
            if (!booking.getStudent().getId().equals(student.getId())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You can only view your own bookings");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            BookingRequestDTO bookingDTO = convertToDTO(booking);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("booking", bookingDTO);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Hủy booking (Student)
     */
    @PutMapping("/student/{bookingId}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> cancelStudentBooking(@PathVariable Integer bookingId,
                                         Authentication authentication) {
        try {
            String username = authentication.getName();
            Booking cancelledBooking = bookingService.cancelBookingByStudent(bookingId, username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking đã được hủy thành công");
            response.put("bookingId", cancelledBooking.getId());
            response.put("status", cancelledBooking.getStatus().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== TUTOR ENDPOINTS ====================

    /**
     * Lấy danh sách booking của tutor
     */
    @GetMapping("/tutor/my-bookings")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Page<Booking>> getTutorBookings(Authentication authentication, Pageable pageable) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            TutorProfile tutor = user.getTutorProfile()
                    .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
            
            Page<Booking> bookings = bookingRepository.findByTutor(tutor, pageable);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy booking của tutor theo trạng thái
     */
    @GetMapping("/tutor/my-bookings/status/{status}")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Page<Booking>> getTutorBookingsByStatus(
            @PathVariable BookingStatus status,
            Authentication authentication,
            Pageable pageable) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            TutorProfile tutor = user.getTutorProfile()
                    .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
            
            Page<Booking> bookings = bookingRepository.findByTutorAndStatus(tutor, status, pageable);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Chấp nhận booking (Tutor)
     */
    @PutMapping("/tutor/{id}/approve")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<?> approveTutorBooking(@PathVariable Integer id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            TutorProfile tutor = user.getTutorProfile()
                    .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
            
            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Verify ownership
            if (!booking.getTutor().getId().equals(tutor.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You can only approve your own bookings");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Update status: tutor chấp nhận -> chuyển sang TUTOR_APPROVED
            booking.setStatus(BookingStatus.TUTOR_APPROVED);
            bookingRepository.save(booking);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking approved successfully");
            response.put("bookingId", booking.getId());
            response.put("status", booking.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to approve booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Từ chối booking (Tutor)
     */
    @PutMapping("/tutor/{id}/reject")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<?> rejectTutorBooking(@PathVariable Integer id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            TutorProfile tutor = user.getTutorProfile()
                    .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
            
            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Verify ownership
            if (!booking.getTutor().getId().equals(tutor.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You can only reject your own bookings");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Update status
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking rejected successfully");
            response.put("bookingId", booking.getId());
            response.put("status", booking.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to reject booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Lấy tất cả booking (Admin)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Booking>> getAllBookingsForAdmin(Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findAll(pageable);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Lấy booking theo trạng thái (Admin)
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Booking>> getAdminBookingsByStatus(@PathVariable BookingStatus status, Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findByStatus(status, pageable);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Cập nhật trạng thái booking (Admin)
     */
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBookingStatusByAdmin(@PathVariable Integer id, @RequestParam BookingStatus status) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                booking.setStatus(status);
                bookingRepository.save(booking);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Booking status updated successfully");
                response.put("bookingId", booking.getId());
                response.put("newStatus", booking.getStatus());
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update booking status: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Xóa booking (Admin)
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBookingByAdmin(@PathVariable Integer id) {
        try {
            if (bookingRepository.existsById(id)) {
                bookingRepository.deleteById(id);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Booking deleted successfully");
                response.put("deletedBookingId", id);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Convert Booking entity to simplified DTO
     */
    private BookingRequestDTO convertToDTO(Booking booking) {
        System.out.println("=== Converting booking " + booking.getId() + " ===");
        
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setId(booking.getId());
        dto.setStatus(booking.getStatus() != null ? booking.getStatus().toString() : "UNKNOWN");
        dto.setBookingType(booking.getBookingType() != null ? booking.getBookingType().toString() : "UNKNOWN");
        dto.setDate(booking.getDate());
        dto.setFromTime(booking.getFromTime());
        dto.setToTime(booking.getToTime());
        dto.setNote(booking.getNote());
        
        // Safe conversion for totalAmount
        if (booking.getTotalAmount() != null) {
            dto.setTotalAmount(booking.getTotalAmount().doubleValue());
        } else {
            System.out.println("Warning: totalAmount is null for booking " + booking.getId());
            dto.setTotalAmount(0.0);
        }

        // Student info (minimal)
        if (booking.getStudent() != null) {
            System.out.println("Processing student info for booking " + booking.getId());
            User studentUser = booking.getStudent();
            BookingRequestDTO.StudentInfo studentInfo = new BookingRequestDTO.StudentInfo();
            studentInfo.setId(studentUser.getId());
            studentInfo.setFirstName(studentUser.getFirstName());
            studentInfo.setLastName(studentUser.getLastName());
            studentInfo.setEmail(studentUser.getEmail());
            dto.setStudent(studentInfo);
        } else {
            System.out.println("Warning: Student is null for booking " + booking.getId());
        }

        // Tutor info (minimal)
        if (booking.getTutor() != null && booking.getTutor().getUser() != null) {
            System.out.println("Processing tutor info for booking " + booking.getId());
            User tutorUser = booking.getTutor().getUser();
            BookingRequestDTO.TutorInfo tutorInfo = new BookingRequestDTO.TutorInfo();
            tutorInfo.setId(tutorUser.getId());
            tutorInfo.setFirstName(tutorUser.getFirstName());
            tutorInfo.setLastName(tutorUser.getLastName());
            tutorInfo.setEmail(tutorUser.getEmail());

            // Lấy thêm thông tin từ TutorProfile
            tutorInfo.setHeadline(booking.getTutor().getHeadline());
            tutorInfo.setFees(booking.getTutor().getFees());
            // tutorInfo.setCity(booking.getTutor().getCity()); // city field removed

            dto.setTutor(tutorInfo);
        } else {
            System.out.println("Warning: Tutor or TutorUser is null for booking " + booking.getId());
        }

        // Subject info
        if (booking.getSubject() != null) {
            System.out.println("Processing subject info for booking " + booking.getId());
            BookingRequestDTO.SubjectInfo subjectInfo = new BookingRequestDTO.SubjectInfo();
            subjectInfo.setId(booking.getSubject().getId());
            subjectInfo.setName(booking.getSubject().getName());
            dto.setSubject(subjectInfo);
        } else {
            System.out.println("Warning: Subject is null for booking " + booking.getId());
        }

        System.out.println("Successfully created DTO for booking " + booking.getId());
        return dto;
    }
}
