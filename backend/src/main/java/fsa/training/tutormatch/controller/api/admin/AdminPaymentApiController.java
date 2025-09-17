package fsa.training.tutormatch.controller.api.admin;

import fsa.training.tutormatch.dto.PaymentDTO;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.repository.PaymentRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentApiController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy danh sách tất cả payments với pagination và filter
     */
    @GetMapping
    public ResponseEntity<?> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) Integer studentId,
            @RequestParam(required = false) Integer tutorId) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Payment> paymentPage;
            
            // Apply filters
            if (status != null && !status.trim().isEmpty()) {
                try {
                    Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
                    paymentPage = paymentRepository.findByStatus(paymentStatus, pageable);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Status không hợp lệ: " + status)
                    );
                }
            } else if (studentId != null) {
                Optional<User> studentOpt = userRepository.findById(studentId);
                if (studentOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Student không tồn tại")
                    );
                }
                paymentPage = paymentRepository.findByStudent(studentOpt.get(), pageable);
            } else if (tutorId != null) {
                Optional<User> tutorOpt = userRepository.findById(tutorId);
                if (tutorOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Tutor không tồn tại")
                    );
                }
                paymentPage = paymentRepository.findByTutor(tutorOpt.get(), pageable);
            } else {
                paymentPage = paymentRepository.findAll(pageable);
            }

            // Convert to DTOs
            List<PaymentDTO> paymentDTOs = paymentPage.getContent().stream()
                .map(this::convertPaymentToDTO)
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("payments", paymentDTOs);
            response.put("totalElements", paymentPage.getTotalElements());
            response.put("totalPages", paymentPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy danh sách payments: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy chi tiết payment theo ID
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPaymentDetail(@PathVariable Integer paymentId) {
        try {
            Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PaymentDTO paymentDTO = convertPaymentToDetailDTO(paymentOpt.get());
            return ResponseEntity.ok(paymentDTO);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy chi tiết payment: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật trạng thái payment
     */
    @PutMapping("/{paymentId}/status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Integer paymentId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Status không được để trống")
                );
            }

            Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Payment payment = paymentOpt.get();
            
            try {
                Payment.PaymentStatus status = Payment.PaymentStatus.valueOf(newStatus.toUpperCase());
                payment.setStatus(status);
                
                // Set paidAt if status is COMPLETED
                if (status == Payment.PaymentStatus.COMPLETED && payment.getPaidAt() == null) {
                    payment.setPaidAt(new java.sql.Timestamp(System.currentTimeMillis()));
                }
                
                paymentRepository.save(payment);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật trạng thái payment thành công",
                    "payment", convertPaymentToDTO(payment)
                ));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Status không hợp lệ: " + newStatus)
                );
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi cập nhật trạng thái payment: " + e.getMessage())
            );
        }
    }

    /**
     * Hoàn tiền payment
     */
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable Integer paymentId) {
        try {
            Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Payment payment = paymentOpt.get();
            
            if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Chỉ có thể hoàn tiền cho payment đã hoàn thành")
                );
            }
            
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            return ResponseEntity.ok(Map.of(
                "message", "Hoàn tiền thành công",
                "payment", convertPaymentToDTO(payment)
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi hoàn tiền: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thống kê payments
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getPaymentStatistics() {
        try {
            long totalPayments = paymentRepository.count();
            long pendingPayments = paymentRepository.countByStatus(Payment.PaymentStatus.PENDING);
            long completedPayments = paymentRepository.countByStatus(Payment.PaymentStatus.COMPLETED);
            long failedPayments = paymentRepository.countByStatus(Payment.PaymentStatus.FAILED);
            long refundedPayments = paymentRepository.countByStatus(Payment.PaymentStatus.REFUNDED);

            // Total revenue (completed payments only)
            BigDecimal totalRevenue = paymentRepository.sumAmountByStatus(Payment.PaymentStatus.COMPLETED);
            if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPayments", totalPayments);
            stats.put("pendingPayments", pendingPayments);
            stats.put("completedPayments", completedPayments);
            stats.put("failedPayments", failedPayments);
            stats.put("refundedPayments", refundedPayments);
            stats.put("totalRevenue", totalRevenue);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi lấy thống kê payments: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy báo cáo doanh thu theo thời gian
     */
    @GetMapping("/revenue-report")
    public ResponseEntity<?> getRevenueReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "monthly") String period) {
        try {
            // Implementation for revenue report
            // This would require additional repository methods to aggregate data by time periods
            
            Map<String, Object> report = new HashMap<>();
            report.put("period", period);
            report.put("data", "Revenue report data would be here");
            
            return ResponseEntity.ok(report);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi tạo báo cáo doanh thu: " + e.getMessage())
            );
        }
    }

    /**
     * Helper method to convert Payment to DTO
     */
    private PaymentDTO convertPaymentToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setBookingId(payment.getBooking() != null ? payment.getBooking().getId() : null);
        dto.setAmount(payment.getAmount());
        dto.setOriginalAmount(payment.getOriginalAmount());
        dto.setDiscountAmount(payment.getDiscountAmount());
        dto.setCouponCode(payment.getCoupon() != null ? payment.getCoupon().getCode() : null);
        dto.setPaymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().toString() : null);
        dto.setStatus(payment.getStatus() != null ? payment.getStatus().toString() : null);
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentGateway(payment.getPaymentGateway());
        dto.setDescription(payment.getDescription());
        dto.setPaidAt(payment.getPaidAt() != null ? payment.getPaidAt().toString() : null);
        dto.setCreatedAt(payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : null);
        
        if (payment.getStudent() != null) {
            dto.setStudentId(payment.getStudent().getId());
            dto.setStudentName(payment.getStudent().getFirstName() + " " + payment.getStudent().getLastName());
        }
        
        if (payment.getTutor() != null) {
            dto.setTutorId(payment.getTutor().getId());
            dto.setTutorName(payment.getTutor().getFirstName() + " " + payment.getTutor().getLastName());
        }
        
        return dto;
    }

    /**
     * Helper method to convert Payment to detailed DTO
     */
    private PaymentDTO convertPaymentToDetailDTO(Payment payment) {
        PaymentDTO dto = convertPaymentToDTO(payment);
        
        // Add more detailed information if needed
        // Gateway response, booking details, etc.
        
        return dto;
    }
} 