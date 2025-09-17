package fsa.training.tutormatch.controller.api.booking;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.BookingStatus;
import fsa.training.tutormatch.entity.BookingType;
import fsa.training.tutormatch.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /**
     * Tạo booking mới
     */
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingService.CreateBookingRequest request) {
        try {
            Booking createdBooking = bookingService.createBooking(request);
            return ResponseEntity.ok(createdBooking);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tạo booking thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

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
            "TRIAL", "Student → Payment → Auto Approve → Confirmed",
            "SINGLE_SESSION", "Student → Payment → Auto Approve → Confirmed", 
            "PACKAGE", "Student → Select Schedule → Tutor Approve → Payment → Confirmed"
        ));
        
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin booking theo ID (cần authentication)
     * Chuyển hướng đến controller phù hợp dựa trên role
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Integer id) {
        // Endpoint này sẽ được xử lý bởi các controller chuyên biệt
        // StudentBookingController, TutorBookingController, AdminBookingController
        Map<String, String> error = new HashMap<>();
        error.put("error", "Vui lòng sử dụng endpoint phù hợp với role của bạn");
        error.put("student", "/api/booking/student/{id}");
        error.put("tutor", "/api/booking/tutor/{id}");
        error.put("admin", "/api/booking/admin/{id}");
        return ResponseEntity.badRequest().body(error);
    }
}
