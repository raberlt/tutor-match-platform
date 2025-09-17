package fsa.training.tutormatch.controller.api.booking.admin;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;
import fsa.training.tutormatch.entity.BookingType;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/booking/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class AdminBookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Lấy tất cả booking (admin only)
     */
    @GetMapping("/all")
    public ResponseEntity<Page<Booking>> getAllBookings(Pageable pageable) {
        try {
            Page<Booking> bookings = bookingRepository.findAll(pageable);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy booking theo trạng thái (admin only)
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<Booking>> getBookingsByStatus(@PathVariable BookingStatus status, Pageable pageable) {
        try {
            Page<Booking> bookings = bookingRepository.findByStatus(status, pageable);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy chi tiết booking (admin only)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Integer id) {
        Optional<Booking> booking = bookingService.getBookingById(id);
        return booking.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Cập nhật trạng thái booking (admin only)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Integer id, @RequestParam BookingStatus status) {
        try {
            Optional<Booking> booking = bookingService.getBookingById(id);
            if (booking.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Không tìm thấy booking");
                return ResponseEntity.status(404).body(error);
            }

            booking.get().setStatus(status);
            Booking updatedBooking = bookingService.updateBooking(booking.get());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cập nhật trạng thái booking thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Cập nhật trạng thái booking thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Xóa booking (admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Integer id) {
        try {
            Optional<Booking> booking = bookingService.getBookingById(id);
            if (booking.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Không tìm thấy booking");
                return ResponseEntity.status(404).body(error);
            }

            bookingService.deleteBooking(booking.get());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Xóa booking thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Xóa booking thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Thống kê tổng quan booking (admin only)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getBookingStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Thống kê theo trạng thái
            stats.put("totalBookings", bookingRepository.count());
            stats.put("pendingBookings", bookingRepository.countByStatus(BookingStatus.PENDING));
            stats.put("confirmedBookings", bookingRepository.countByStatus(BookingStatus.CONFIRMED));
            stats.put("completedBookings", bookingRepository.countByStatus(BookingStatus.COMPLETED));
            stats.put("cancelledBookings", bookingRepository.countByStatus(BookingStatus.CANCELLED));
            
            // Thống kê theo loại booking
            stats.put("trialBookings", bookingRepository.countByBookingType(BookingType.TRIAL));
            stats.put("singleSessionBookings", bookingRepository.countByBookingType(BookingType.SINGLE_SESSION));
            stats.put("packageBookings", bookingRepository.countByBookingType(BookingType.PACKAGE));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lấy thống kê thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy danh sách booking theo loại (admin only)
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<Page<Booking>> getBookingsByType(@PathVariable BookingType type, Pageable pageable) {
        try {
            // Tạo query để lấy booking theo type
            List<Booking> allBookings = bookingRepository.findAll();
            List<Booking> filteredBookings = allBookings.stream()
                    .filter(booking -> booking.getBookingType() == type)
                    .toList();
            
            // Convert to Page (simplified implementation)
            Page<Booking> bookings = new org.springframework.data.domain.PageImpl<>(filteredBookings, pageable, filteredBookings.size());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
