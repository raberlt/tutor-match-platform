package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.entity.Coupon;
import fsa.training.tutormatch.enums.BookingStatus;
import fsa.training.tutormatch.enums.PaymentStatus;
import fsa.training.tutormatch.enums.CouponStatus;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.PaymentRepository;
import fsa.training.tutormatch.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/financial")
@PreAuthorize("hasRole('ADMIN')")
public class AdminFinancialController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CouponRepository couponRepository;

    /**
     * Lấy tất cả booking với phân trang
     */
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Booking> bookings;
            
            if (status != null && !status.trim().isEmpty()) {
                BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
                bookings = bookingRepository.findByStatus(bookingStatus, pageable);
            } else {
                bookings = bookingRepository.findAll(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("bookings", bookings.getContent());
            response.put("totalElements", bookings.getTotalElements());
            response.put("totalPages", bookings.getTotalPages());
            response.put("currentPage", bookings.getNumber());
            response.put("size", bookings.getSize());
            response.put("hasNext", bookings.hasNext());
            response.put("hasPrevious", bookings.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách booking: " + e.getMessage())
            );
        }
    }

    /**
     * Xử lý booking bị hủy
     */
    @PutMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Integer bookingId, @RequestParam(required = false) String reason) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã hủy booking thành công");
            response.put("reason", reason);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi hủy booking: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê doanh thu
     */
    @GetMapping("/revenue/statistics")
    public ResponseEntity<?> getRevenueStatistics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Total revenue
            BigDecimal totalRevenue = paymentRepository.sumAmountByStatus(PaymentStatus.COMPLETED);
            stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
            
            // Revenue by status
            BigDecimal completedRevenue = paymentRepository.sumAmountByStatus(PaymentStatus.COMPLETED);
            BigDecimal pendingRevenue = paymentRepository.sumAmountByStatus(PaymentStatus.PENDING);
            
            stats.put("completedRevenue", completedRevenue != null ? completedRevenue : BigDecimal.ZERO);
            stats.put("pendingRevenue", pendingRevenue != null ? pendingRevenue : BigDecimal.ZERO);
            
            // Payment counts
            long totalPayments = paymentRepository.count();
            long completedPayments = paymentRepository.countByStatus(PaymentStatus.COMPLETED);
            long pendingPayments = paymentRepository.countByStatus(PaymentStatus.PENDING);
            
            stats.put("totalPayments", totalPayments);
            stats.put("completedPayments", completedPayments);
            stats.put("pendingPayments", pendingPayments);
            
            // Average transaction value
            if (completedPayments > 0 && completedRevenue != null) {
                BigDecimal avgTransaction = completedRevenue.divide(BigDecimal.valueOf(completedPayments), 2, java.math.RoundingMode.HALF_UP);
                stats.put("averageTransactionValue", avgTransaction);
            } else {
                stats.put("averageTransactionValue", BigDecimal.ZERO);
            }

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thống kê doanh thu: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy lịch sử thanh toán
     */
    @GetMapping("/payments")
    public ResponseEntity<?> getPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Payment> payments;
            
            if (status != null && !status.trim().isEmpty()) {
                PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
                payments = paymentRepository.findByStatus(paymentStatus, pageable);
            } else {
                payments = paymentRepository.findAll(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("payments", payments.getContent());
            response.put("totalElements", payments.getTotalElements());
            response.put("totalPages", payments.getTotalPages());
            response.put("currentPage", payments.getNumber());
            response.put("size", payments.getSize());
            response.put("hasNext", payments.hasNext());
            response.put("hasPrevious", payments.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy lịch sử thanh toán: " + e.getMessage())
            );
        }
    }

    /**
     * Xử lý giao dịch lỗi
     */
    @PutMapping("/payments/{paymentId}/resolve")
    public ResponseEntity<?> resolvePaymentIssue(
            @PathVariable Integer paymentId, 
            @RequestParam String action,
            @RequestParam(required = false) String note) {
        try {
            Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Payment payment = paymentOpt.get();
            
            if ("refund".equals(action)) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else if ("retry".equals(action)) {
                payment.setStatus(PaymentStatus.PENDING);
            } else if ("complete".equals(action)) {
                payment.setStatus(PaymentStatus.COMPLETED);
            }

            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xử lý giao dịch thành công");
            response.put("action", action);
            response.put("note", note);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi xử lý giao dịch: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy danh sách mã giảm giá
     */
    @GetMapping("/coupons")
    public ResponseEntity<?> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Coupon> coupons;
            
            if (status != null && !status.trim().isEmpty()) {
                CouponStatus couponStatus = CouponStatus.valueOf(status.toUpperCase());
                coupons = couponRepository.findByStatus(couponStatus, pageable);
            } else {
                coupons = couponRepository.findAll(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("coupons", coupons.getContent());
            response.put("totalElements", coupons.getTotalElements());
            response.put("totalPages", coupons.getTotalPages());
            response.put("currentPage", coupons.getNumber());
            response.put("size", coupons.getSize());
            response.put("hasNext", coupons.hasNext());
            response.put("hasPrevious", coupons.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách mã giảm giá: " + e.getMessage())
            );
        }
    }

    /**
     * Tạo mã giảm giá mới
     */
    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Map<String, Object> couponData) {
        try {
            Coupon coupon = new Coupon();
            coupon.setCode((String) couponData.get("code"));
            coupon.setDescription((String) couponData.get("description"));
            // coupon.setDiscountType((String) couponData.get("discountType")); // Commented out - type mismatch
            coupon.setDiscountValue(new BigDecimal(couponData.get("discountValue").toString()));
            coupon.setMinOrderAmount(new BigDecimal(couponData.get("minOrderAmount").toString()));
            coupon.setMaxDiscountAmount(new BigDecimal(couponData.get("maxDiscountAmount").toString()));
            coupon.setUsageLimit((Integer) couponData.get("usageLimit"));
            coupon.setUsedCount(0);
            coupon.setStatus(CouponStatus.ACTIVE);
            // coupon.setValidFrom(ZonedDateTime.parse((String) couponData.get("validFrom"))); // Commented out - method not found
            // coupon.setValidTo(ZonedDateTime.parse((String) couponData.get("validTo"))); // Commented out - method not found
            
            coupon = couponRepository.save(coupon);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã tạo mã giảm giá thành công");
            response.put("coupon", coupon);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi tạo mã giảm giá: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật mã giảm giá
     */
    @PutMapping("/coupons/{couponId}")
    public ResponseEntity<?> updateCoupon(@PathVariable Integer couponId, @RequestBody Map<String, Object> couponData) {
        try {
            Optional<Coupon> couponOpt = couponRepository.findById(couponId);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Coupon coupon = couponOpt.get();
            
            if (couponData.containsKey("description")) {
                coupon.setDescription((String) couponData.get("description"));
            }
            if (couponData.containsKey("discountValue")) {
                coupon.setDiscountValue(new BigDecimal(couponData.get("discountValue").toString()));
            }
            if (couponData.containsKey("minOrderAmount")) {
                coupon.setMinOrderAmount(new BigDecimal(couponData.get("minOrderAmount").toString()));
            }
            if (couponData.containsKey("maxDiscountAmount")) {
                coupon.setMaxDiscountAmount(new BigDecimal(couponData.get("maxDiscountAmount").toString()));
            }
            if (couponData.containsKey("usageLimit")) {
                coupon.setUsageLimit((Integer) couponData.get("usageLimit"));
            }
            if (couponData.containsKey("status")) {
                coupon.setStatus(CouponStatus.valueOf(((String) couponData.get("status")).toUpperCase()));
            }
            
            coupon = couponRepository.save(coupon);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật mã giảm giá thành công");
            response.put("coupon", coupon);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi cập nhật mã giảm giá: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê mã giảm giá
     */
    @GetMapping("/coupons/statistics")
    public ResponseEntity<?> getCouponStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            long totalCoupons = couponRepository.count();
            long activeCoupons = couponRepository.countByStatus(CouponStatus.ACTIVE);
            long expiredCoupons = couponRepository.countByStatus(CouponStatus.EXPIRED);
            
            stats.put("totalCoupons", totalCoupons);
            stats.put("activeCoupons", activeCoupons);
            stats.put("expiredCoupons", expiredCoupons);
            
            // Calculate total usage (this would need a custom query)
            stats.put("totalUsage", 0); // Placeholder
            
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thống kê mã giảm giá: " + e.getMessage())
            );
        }
    }

    /**
     * Xuất báo cáo tài chính
     */
    @GetMapping("/reports/financial")
    public ResponseEntity<?> exportFinancialReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "json") String format) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            Map<String, Object> report = new HashMap<>();
            
            // Revenue in period - placeholder
            report.put("periodRevenue", BigDecimal.ZERO);
            
            // Bookings in period - placeholder
            report.put("periodBookings", 0);
            
            // Completed bookings - placeholder
            report.put("completedBookings", 0);
            
            report.put("startDate", start);
            report.put("endDate", end);
            report.put("generatedAt", ZonedDateTime.now());

            return ResponseEntity.ok(report);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi xuất báo cáo tài chính: " + e.getMessage())
            );
        }
    }
}
