package fsa.training.tutormatch.controller.api.booking.admin;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;
import fsa.training.tutormatch.entity.BookingType;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingApiController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy danh sách tất cả bookings với pagination và filter
     */
    @GetMapping
    public ResponseEntity<?> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bookingType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer tutorId,
            @RequestParam(required = false) Integer studentId) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Booking> bookingPage;
            
            // Apply filters
            if (status != null && !status.trim().isEmpty()) {
                try {
                    BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
                    bookingPage = bookingRepository.findByStatus(bookingStatus, pageable);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Status không hợp lệ: " + status)
                    );
                }
            } else if (tutorId != null) {
                Optional<User> tutorOpt = userRepository.findById(tutorId);
                if (tutorOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Tutor không tồn tại")
                    );
                }
                bookingPage = bookingRepository.findByTutorUser(tutorOpt.get(), pageable);
            } else if (studentId != null) {
                Optional<User> studentOpt = userRepository.findById(studentId);
                if (studentOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Student không tồn tại")
                    );
                }
                bookingPage = bookingRepository.findByStudentUser(studentOpt.get(), pageable);
            } else {
                bookingPage = bookingRepository.findAll(pageable);
            }

            // Convert to DTOs
            List<Map<String, Object>> bookingDTOs = bookingPage.getContent().stream()
                .map(this::convertBookingToAdminDTO)
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("bookings", bookingDTOs);
            response.put("totalElements", bookingPage.getTotalElements());
            response.put("totalPages", bookingPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách bookings: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy chi tiết booking theo ID
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingDetail(@PathVariable Integer bookingId) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            Map<String, Object> bookingDetail = convertBookingToDetailDTO(booking);

            return ResponseEntity.ok(bookingDetail);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy chi tiết booking: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật trạng thái booking
     */
    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Integer bookingId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Status không được để trống")
                );
            }

            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            
            try {
                BookingStatus status = BookingStatus.valueOf(newStatus.toUpperCase());
                booking.setStatus(status);
                bookingRepository.save(booking);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật trạng thái booking thành công",
                    "booking", convertBookingToAdminDTO(booking)
                ));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Status không hợp lệ: " + newStatus)
                );
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi cập nhật trạng thái booking: " + e.getMessage())
            );
        }
    }

    /**
     * Xóa booking
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Integer bookingId) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            
            // Set status to cancelled instead of hard delete
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);

            return ResponseEntity.ok(Map.of(
                "message", "Hủy booking thành công"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi hủy booking: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê bookings
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getBookingStatistics() {
        try {
            long totalBookings = bookingRepository.count();
            long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
            long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
            long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
            long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);

            // Bookings today
            Date today = Date.valueOf(LocalDate.now());
            long todayBookings = bookingRepository.countByDate(today);

            // Recent bookings (last 7 days)
            Timestamp sevenDaysAgo = new Timestamp(System.currentTimeMillis() - 7L * 24 * 60 * 60 * 1000);
            long recentBookings = bookingRepository.countByCreatedAtAfter(sevenDaysAgo);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBookings", totalBookings);
            stats.put("pendingBookings", pendingBookings);
            stats.put("confirmedBookings", confirmedBookings);
            stats.put("completedBookings", completedBookings);
            stats.put("cancelledBookings", cancelledBookings);
            stats.put("todayBookings", todayBookings);
            stats.put("recentBookings", recentBookings);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thống kê bookings: " + e.getMessage())
            );
        }
    }

    /**
     * Helper method to convert Booking to Admin DTO
     */
    private Map<String, Object> convertBookingToAdminDTO(Booking booking) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", booking.getId());
        dto.put("date", booking.getDate());
        dto.put("time", booking.getTime());
        dto.put("status", booking.getStatus().toString());
        dto.put("bookingType", booking.getBookingType() != null ? booking.getBookingType().toString() : "TRIAL");
        dto.put("contractDuration", booking.getContractDuration());
        dto.put("sessionsPerWeek", booking.getSessionsPerWeek());
        dto.put("totalAmount", booking.getTotalAmount());
        dto.put("note", booking.getNote());
        dto.put("createdAt", booking.getCreatedAt());
        dto.put("updatedAt", booking.getUpdatedAt());

        // Student info
        if (booking.getStudent() != null) {
            StudentProfile studentProfile = booking.getStudent();
            User studentUser = studentProfile.getUser(); // Lấy User từ StudentProfile

            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("id", studentProfile.getId());
            studentInfo.put("username", studentUser.getUsername());
            studentInfo.put("firstName", studentUser.getFirstName());
            studentInfo.put("lastName", studentUser.getLastName());

            // Optional: thêm thông tin khác nếu cần
            studentInfo.put("city", studentProfile.getCity());

            dto.put("student", studentInfo);
        }


        // Tutor info
        if (booking.getTutor() != null) {
            TutorProfile tutorProfile = booking.getTutor();
            User tutorUser = tutorProfile.getUser(); // Lấy user từ TutorProfile

            Map<String, Object> tutorInfo = new HashMap<>();
            tutorInfo.put("id", tutorProfile.getId());
            tutorInfo.put("username", tutorUser.getUsername());
            tutorInfo.put("firstName", tutorUser.getFirstName());
            tutorInfo.put("lastName", tutorUser.getLastName());

            // Optional: thêm thông tin chuyên môn của tutor
            tutorInfo.put("headline", tutorProfile.getHeadline());
            tutorInfo.put("fees", tutorProfile.getFees());
            tutorInfo.put("city", tutorProfile.getCity());

            dto.put("tutor", tutorInfo);
        }


        // Subject info
        if (booking.getSubject() != null) {
            Map<String, Object> subjectInfo = new HashMap<>();
            subjectInfo.put("id", booking.getSubject().getId());
            subjectInfo.put("name", booking.getSubject().getName());
            dto.put("subject", subjectInfo);
        }
        
        return dto;
    }

    /**
     * Helper method to convert Booking to detailed DTO
     */
    private Map<String, Object> convertBookingToDetailDTO(Booking booking) {
        Map<String, Object> dto = convertBookingToAdminDTO(booking);
        
        // Add more detailed information if needed
        // This can include payment information, related schedules, etc.
        
        return dto;
    }
} 