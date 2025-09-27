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
// import fsa.training.tutormatch.service.BookingService; // Deleted - using IBookingService
import fsa.training.tutormatch.service.BookingService;
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
    private BookingService iBookingService;

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
     * Tạo booking mới (Student)
     */
    @PostMapping("/student/create")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createBookingForStudent(@RequestBody BookingRequestCreateDTO request, 
                                         Authentication authentication) {
        try {
            String username = authentication.getName();
            Booking booking = iBookingService.createBooking(username, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đặt lịch thành công!");
            response.put("bookingId", booking.getId());
            response.put("status", "PENDING");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Đặt lịch thất bại: " + e.getMessage());
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
            String username = authentication.getName();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Booking> bookings;
            
            if (status != null && !status.isEmpty()) {
                BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
                bookings = bookingRepository.findByStudentAndStatus(user, bookingStatus, pageable);
            } else {
                bookings = bookingRepository.findByStudent(user, pageable);
            }
            
            List<BookingRequestDTO> bookingDTOs = bookings.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookingDTOs);
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
            Booking cancelledBooking = iBookingService.cancelBookingByStudent(bookingId, username);
            
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
            
            // Update status
            booking.setStatus(BookingStatus.CONFIRMED);
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
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setId(booking.getId());
        dto.setStatus(booking.getStatus().toString());
        dto.setBookingType(booking.getBookingType().toString());
        dto.setDate(booking.getDate());
        dto.setFromTime(booking.getFromTime());
        dto.setToTime(booking.getToTime());
        dto.setNote(booking.getNote());
        dto.setTotalAmount(booking.getTotalAmount().doubleValue());

        // Student info (minimal)
        if (booking.getStudent() != null) {
            User studentUser = booking.getStudent();
            BookingRequestDTO.StudentInfo studentInfo = new BookingRequestDTO.StudentInfo();
            studentInfo.setId(studentUser.getId());
            studentInfo.setFirstName(studentUser.getFirstName());
            studentInfo.setLastName(studentUser.getLastName());
            studentInfo.setEmail(studentUser.getEmail());
            dto.setStudent(studentInfo);
        }

        // Tutor info (minimal)
        if (booking.getTutor() != null && booking.getTutor().getUser() != null) {
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
        }

        // Subject info
        if (booking.getSubject() != null) {
            BookingRequestDTO.SubjectInfo subjectInfo = new BookingRequestDTO.SubjectInfo();
            subjectInfo.setId(booking.getSubject().getId());
            subjectInfo.setName(booking.getSubject().getName());
            dto.setSubject(subjectInfo);
        }

        return dto;
    }
}
