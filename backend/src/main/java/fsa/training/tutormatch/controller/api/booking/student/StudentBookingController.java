package fsa.training.tutormatch.controller.api.booking.student;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.StudentProfileRepository;
import fsa.training.tutormatch.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/booking/student")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class StudentBookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    /**
     * Lấy tất cả booking của học sinh hiện tại
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings() {
        String username = getCurrentUsername();
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUser_Username(username);

        if (studentProfile.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không tìm thấy hồ sơ học sinh");
            return ResponseEntity.status(404).body(error);
        }

        List<Booking> bookings = bookingRepository.findByStudentId(studentProfile.get().getId());
        return ResponseEntity.ok(bookings);
    }

    /**
     * Lấy booking của học sinh theo trạng thái
     */
    @GetMapping("/my-bookings/status/{status}")
    public ResponseEntity<?> getMyBookingsByStatus(@PathVariable BookingStatus status) {
        String username = getCurrentUsername();
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUser_Username(username);

        if (studentProfile.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không tìm thấy hồ sơ học sinh");
            return ResponseEntity.status(404).body(error);
        }

        List<Booking> bookings = bookingRepository.findByStudentAndStatus(studentProfile.get(), status);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Lấy chi tiết booking của học sinh (chỉ booking của mình)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getMyBookingById(@PathVariable Integer id) {
        String username = getCurrentUsername();
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUser_Username(username);

        if (studentProfile.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không tìm thấy hồ sơ học sinh");
            return ResponseEntity.status(404).body(error);
        }

        Optional<Booking> booking = bookingService.getBookingById(id);
        if (booking.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không tìm thấy booking");
            return ResponseEntity.status(404).body(error);
        }

        // Kiểm tra xem booking có thuộc về học sinh này không
        if (!booking.get().getStudent().getId().equals(studentProfile.get().getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Bạn không có quyền xem booking này");
            return ResponseEntity.status(403).body(error);
        }

        return ResponseEntity.ok(booking.get());
    }

    /**
     * Tạo booking mới (chỉ học sinh)
     */
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingService.CreateBookingRequest request) {
        String username = getCurrentUsername();
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUser_Username(username);

        if (studentProfile.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không tìm thấy hồ sơ học sinh");
            return ResponseEntity.status(404).body(error);
        }

        try {
            // Set student ID từ profile hiện tại
            request.setStudentId(studentProfile.get().getId());
            
            Booking createdBooking = bookingService.createBooking(request);
            return ResponseEntity.ok(createdBooking);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tạo booking thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Hủy booking (chỉ học sinh, chỉ khi booking chưa được xác nhận)
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Integer id) {
        String username = getCurrentUsername();
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUser_Username(username);

        if (studentProfile.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không tìm thấy hồ sơ học sinh");
            return ResponseEntity.status(404).body(error);
        }

        Optional<Booking> booking = bookingService.getBookingById(id);
        if (booking.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không tìm thấy booking");
            return ResponseEntity.status(404).body(error);
        }

        // Kiểm tra xem booking có thuộc về học sinh này không
        if (!booking.get().getStudent().getId().equals(studentProfile.get().getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Bạn không có quyền hủy booking này");
            return ResponseEntity.status(403).body(error);
        }

        // Chỉ cho phép hủy khi booking chưa được xác nhận
        BookingStatus currentStatus = booking.get().getStatus();
        if (currentStatus == BookingStatus.CONFIRMED || currentStatus == BookingStatus.IN_PROGRESS || 
            currentStatus == BookingStatus.COMPLETED) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể hủy booking đã được xác nhận");
            return ResponseEntity.badRequest().body(error);
        }

        booking.get().setStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingService.updateBooking(booking.get());
        return ResponseEntity.ok(updatedBooking);
    }

    /**
     * Lấy thống kê booking cho học sinh
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStudentBookingStats() {
        String username = getCurrentUsername();
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUser_Username(username);

        if (studentProfile.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không tìm thấy hồ sơ học sinh");
            return ResponseEntity.status(404).body(error);
        }

        StudentProfile student = studentProfile.get();
        long totalBookings = bookingRepository.countByStudent(student);
        long pendingBookings = bookingRepository.countByStudentAndStatus(student, BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByStudentAndStatus(student, BookingStatus.CONFIRMED);
        long completedBookings = bookingRepository.countByStudentAndStatus(student, BookingStatus.COMPLETED);

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", pendingBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("completedBookings", completedBookings);

        return ResponseEntity.ok(stats);
    }
}
