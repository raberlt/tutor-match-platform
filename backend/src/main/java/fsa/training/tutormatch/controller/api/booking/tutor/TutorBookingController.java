package fsa.training.tutormatch.controller.api.booking.tutor;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;
import fsa.training.tutormatch.entity.BookingType;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.TutorProfileRepository;
import fsa.training.tutormatch.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/booking/tutor")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class TutorBookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    /**
     * Lấy tất cả booking của tutor
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<Page<Booking>> getMyBookings(Authentication authentication, Pageable pageable) {
        try {
            String username = authentication.getName();
            Optional<TutorProfile> tutorProfile = tutorProfileRepository.findByUser_Username(username);
            
            if (tutorProfile.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Page<Booking> bookings = bookingRepository.findByTutor(tutorProfile.get(), pageable);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy booking theo trạng thái
     */
    @GetMapping("/my-bookings/status/{status}")
    public ResponseEntity<Page<Booking>> getMyBookingsByStatus(
            Authentication authentication, 
            @PathVariable BookingStatus status, 
            Pageable pageable) {
        try {
            String username = authentication.getName();
            Optional<TutorProfile> tutorProfile = tutorProfileRepository.findByUser_Username(username);
            
            if (tutorProfile.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Page<Booking> bookings = bookingRepository.findByTutorAndStatus(tutorProfile.get(), status, pageable);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Chấp nhận booking (chỉ cho gói PACKAGE)
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Integer id, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<Booking> booking = bookingService.getBookingById(id);
            
            if (booking.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Không tìm thấy booking");
                return ResponseEntity.status(404).body(error);
            }

            // Kiểm tra quyền sở hữu
            if (!booking.get().getTutor().getUser().getUsername().equals(username)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Bạn không có quyền thực hiện hành động này");
                return ResponseEntity.status(403).body(error);
            }

            // Chỉ cho phép accept với gói PACKAGE
            if (booking.get().getBookingType() != BookingType.PACKAGE) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Chỉ có thể chấp nhận booking gói PACKAGE. Gói TRIAL và SINGLE_SESSION sẽ tự động chấp nhận sau khi thanh toán");
                return ResponseEntity.badRequest().body(error);
            }

            booking.get().setStatus(BookingStatus.TUTOR_APPROVED);
            Booking updatedBooking = bookingService.updateBooking(booking.get());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Chấp nhận booking thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Chấp nhận booking thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Từ chối booking (chỉ cho gói PACKAGE)
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Integer id, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<Booking> booking = bookingService.getBookingById(id);
            
            if (booking.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Không tìm thấy booking");
                return ResponseEntity.status(404).body(error);
            }

            // Kiểm tra quyền sở hữu
            if (!booking.get().getTutor().getUser().getUsername().equals(username)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Bạn không có quyền thực hiện hành động này");
                return ResponseEntity.status(403).body(error);
            }

            // Chỉ cho phép reject với gói PACKAGE
            if (booking.get().getBookingType() != BookingType.PACKAGE) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Chỉ có thể từ chối booking gói PACKAGE. Gói TRIAL và SINGLE_SESSION sẽ tự động chấp nhận sau khi thanh toán");
                return ResponseEntity.badRequest().body(error);
            }

            booking.get().setStatus(BookingStatus.TUTOR_REJECTED);
            Booking updatedBooking = bookingService.updateBooking(booking.get());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Từ chối booking thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Từ chối booking thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy thống kê booking của tutor
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getBookingStats(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<TutorProfile> tutorProfile = tutorProfileRepository.findByUser_Username(username);
            
            if (tutorProfile.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBookings", bookingRepository.countByTutor(tutorProfile.get()));
            stats.put("pendingBookings", bookingRepository.countByTutorAndStatus(tutorProfile.get(), BookingStatus.PENDING));
            stats.put("approvedBookings", bookingRepository.countByTutorAndStatus(tutorProfile.get(), BookingStatus.TUTOR_APPROVED));
            stats.put("completedBookings", bookingRepository.countByTutorAndStatus(tutorProfile.get(), BookingStatus.COMPLETED));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
