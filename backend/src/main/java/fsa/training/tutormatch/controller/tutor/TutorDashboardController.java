package fsa.training.tutormatch.controller.tutor;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// import java.sql.Date; // Using LocalDate now
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tutor/dashboard")
@PreAuthorize("hasRole('TUTOR')")
public class TutorDashboardController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingService bookingService;

    /**
     * Lấy thống kê dashboard cho tutor
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            // ✅ Get TutorProfile từ User (multi-profiles)
            TutorProfile tutor = user.getTutorProfile()
                    .orElseThrow(() -> new RuntimeException("Tutor profile not found"));

            // Today's date
            LocalDate today = LocalDate.now();

            // Count statistics
            long todayClasses = bookingRepository.countByDate(today);
            long pendingRequests = bookingRepository.findByTutorAndStatus(tutor, BookingStatus.PENDING).size();
            long confirmedClasses = bookingRepository.findByTutorAndStatus(tutor, BookingStatus.CONFIRMED).size();

            Map<String, Object> stats = new HashMap<>();
            stats.put("todayClasses", todayClasses);
            stats.put("pendingRequests", pendingRequests);
            stats.put("upcomingClasses", confirmedClasses);
            stats.put("monthlyEarnings", 0.0); // TODO: Calculate from payments

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thống kê: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy danh sách booking requests chờ duyệt
     */
    @GetMapping("/pending-requests")
    public ResponseEntity<?> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            // ✅ Get TutorProfile từ User (multi-profiles)
            TutorProfile tutor = user.getTutorProfile()
                    .orElseThrow(() -> new RuntimeException("Tutor profile not found"));

            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Booking> pendingBookings = bookingRepository.findByTutorAndStatus(
                    tutor, BookingStatus.PENDING, pageable);

            // Convert to simplified format using Map
            List<Map<String, Object>> requestDTOs = pendingBookings.getContent().stream()
                    .map(this::convertToSimpleFormat)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requests", requestDTOs);
            response.put("currentPage", pendingBookings.getNumber());
            response.put("totalPages", pendingBookings.getTotalPages());
            response.put("totalElements", pendingBookings.getTotalElements());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách yêu cầu: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Accept booking request
     */
    @PutMapping("/bookings/{bookingId}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Integer bookingId,
                                           Authentication authentication) {
        try {
            String username = authentication.getName();
            Booking booking = bookingService.acceptBooking(bookingId, username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã chấp nhận yêu cầu đặt lịch");
            response.put("bookingId", booking.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi chấp nhận yêu cầu: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Reject booking request
     */
    @PutMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Integer bookingId,
                                           Authentication authentication) {
        try {
            String username = authentication.getName();
            Booking booking = bookingService.rejectBooking(bookingId, username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã từ chối yêu cầu đặt lịch");
            response.put("bookingId", booking.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi từ chối yêu cầu: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy lịch dạy đã confirm
     */
    @GetMapping("/schedule")
    public ResponseEntity<?> getTeachingSchedule(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            // ✅ Get TutorProfile từ User (multi-profiles)
            TutorProfile tutor = user.getTutorProfile()
                    .orElseThrow(() -> new RuntimeException("Tutor profile not found"));

            List<Booking> schedule;
            if (fromDate != null && toDate != null) {
                LocalDate startDate = LocalDate.parse(fromDate);
                LocalDate endDate = LocalDate.parse(toDate);
                schedule = bookingRepository.findByTutorAndDateBetween(tutor, startDate, endDate);
            } else {
                schedule = bookingRepository.findByTutorAndStatus(tutor, BookingStatus.CONFIRMED);
            }

            // Convert to simplified format using Map
            List<Map<String, Object>> scheduleDTOs = schedule.stream()
                    .map(this::convertToSimpleFormat)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("schedule", scheduleDTOs);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy lịch dạy: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Convert Booking entity to a simplified Map format
     */
    private Map<String, Object> convertToSimpleFormat(Booking booking) {
        Map<String, Object> bookingMap = new HashMap<>();
        bookingMap.put("id", booking.getId());
        bookingMap.put("status", booking.getStatus().toString());
        bookingMap.put("bookingType", booking.getBookingType().toString());
        bookingMap.put("date", booking.getDate());
        bookingMap.put("fromTime", booking.getFromTime());
        bookingMap.put("toTime", booking.getToTime());
        bookingMap.put("note", booking.getNote());
        bookingMap.put("totalAmount", booking.getTotalAmount());
        bookingMap.put("contractDuration", booking.getContractDuration());
        bookingMap.put("sessionsPerWeek", booking.getSessionsPerWeek());

        // Student info (minimal)
        Map<String, Object> studentInfo = new HashMap<>();
        if (booking.getStudent() != null) {
            User studentUser = booking.getStudent();
            studentInfo.put("id", studentUser.getId());
            studentInfo.put("firstName", studentUser.getFirstName());
            studentInfo.put("lastName", studentUser.getLastName());
            studentInfo.put("email", studentUser.getEmail());
        }
        bookingMap.put("student", studentInfo);

        // Tutor info (minimal)
        Map<String, Object> tutorInfo = new HashMap<>();
        if (booking.getTutor() != null && booking.getTutor().getUser() != null) {
            User tutorUser = booking.getTutor().getUser();
            tutorInfo.put("id", tutorUser.getId());
            tutorInfo.put("firstName", tutorUser.getFirstName());
            tutorInfo.put("lastName", tutorUser.getLastName());
            tutorInfo.put("email", tutorUser.getEmail());

            // Extra tutor profile info
            tutorInfo.put("headline", booking.getTutor().getHeadline());
            tutorInfo.put("fees", booking.getTutor().getFees());
            // tutorInfo.put("city", booking.getTutor().getCity()); // city field removed
        }
        bookingMap.put("tutor", tutorInfo);

        // Subject info
        Map<String, Object> subjectInfo = new HashMap<>();
        if (booking.getSubject() != null) {
            subjectInfo.put("id", booking.getSubject().getId());
            subjectInfo.put("name", booking.getSubject().getName());
        }
        bookingMap.put("subject", subjectInfo);

        return bookingMap;
    }
}