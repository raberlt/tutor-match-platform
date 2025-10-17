package fsa.training.tutormatch.controller.payment;

import fsa.training.tutormatch.dto.PaymentDTO;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.PaymentStatus;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.CreditService;
import fsa.training.tutormatch.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private final PaymentService paymentService;
    private final CreditService creditService;
    private final UserRepository userRepository;
    
    /**
     * Tạo payment mới
     */
    @PostMapping
    public ResponseEntity<?> createPayment(@Valid @RequestBody PaymentService.PaymentRequest request) {
        try {
            log.info("Creating payment for booking: {}, amount: {}, method: {}", 
                    request.getBookingId(), request.getAmount(), request.getPaymentMethod());
            
            Payment payment = paymentService.createPayment(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment created successfully");
            response.put("payment", convertToDTO(payment));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating payment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error creating payment: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Tạo QR code thanh toán SePay
     */
    @PostMapping("/{paymentId}/sepay-qr")
    public ResponseEntity<?> createSePayQR(@PathVariable Integer paymentId) {
        try {
            log.info("Creating SePay QR for payment ID: {}", paymentId);
            
            Payment payment = paymentService.createSePayQRPayment(paymentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "QR code created successfully");
            response.put("payment", convertToDTO(payment));
            response.put("qrCodeUrl", payment.getQrCodeUrl());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating SePay QR: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error creating QR code: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Kiểm tra trạng thái thanh toán SePay
     */
    @GetMapping("/{paymentId}/sepay-status")
    public ResponseEntity<?> checkSePayStatus(@PathVariable Integer paymentId) {
        try {
            log.info("Checking SePay status for payment ID: {}", paymentId);
            
            Payment payment = paymentService.checkSePayPaymentStatus(paymentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Status checked successfully");
            response.put("payment", convertToDTO(payment));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error checking SePay status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error checking payment status: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Callback từ SePay
     */
    @PostMapping("/sepay/callback")
    public ResponseEntity<?> sePayCallback(@RequestBody Map<String, String> callbackData) {
        try {
            log.info("Processing SePay callback: {}", callbackData);
            
            String orderId = callbackData.get("orderId");
            String status = callbackData.get("status");
            
            if (orderId == null || status == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing orderId or status in callback"
                ));
            }
            
            Payment payment = paymentService.handleSePayCallback(orderId, status, "Callback from SePay");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Callback processed successfully");
            response.put("payment", convertToDTO(payment));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing SePay callback: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error processing callback: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Lấy số dư tín dụng của user hiện tại
     */
    @GetMapping("/credit-balance")
    public ResponseEntity<?> getCreditBalance(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Getting credit balance for user: {}", username);
            
            // Get user by username instead of casting from principal
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            BigDecimal balance = creditService.getCurrentBalance(currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("balance", balance);
            response.put("currency", "VND");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting credit balance: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error getting credit balance: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Thanh toán bằng tín dụng
     */
    @PostMapping("/{paymentId}/credit")
    public ResponseEntity<?> payWithCredit(@PathVariable Integer paymentId, Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Processing credit payment for payment ID: {} by user: {}", paymentId, username);
            
            // Get user
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            // Get payment
            Payment payment = paymentService.getPaymentById(paymentId);
            
            // Verify payment belongs to user
            if (!payment.getStudent().getId().equals(currentUser.getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Payment does not belong to current user"
                ));
            }
            
            // Check if payment is already completed
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Payment already completed"
                ));
            }
            
            // Process credit payment
            Payment processedPayment = paymentService.processCreditPayment(paymentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment completed successfully");
            response.put("payment", convertToDTO(processedPayment));
            response.put("newBalance", currentUser.getCreditBalance());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing credit payment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error processing payment: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Lấy lịch sử giao dịch tín dụng
     */
    @GetMapping("/credit-history")
    public ResponseEntity<?> getCreditHistory(Pageable pageable, Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Getting credit history for user: {}", username);
            
            // Get user by username instead of casting from principal
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            List<fsa.training.tutormatch.entity.Transaction> transactions = 
                    creditService.getTransactionHistory(currentUser, (int) pageable.getPageSize());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("transactions", transactions);
            response.put("totalElements", transactions.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting credit history: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error getting credit history: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Lấy payments của user hiện tại
     */
    @GetMapping("/my-payments")
    public ResponseEntity<?> getMyPayments(Pageable pageable, Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Getting payments for user: {}", username);
            
            // Get user by username instead of casting from principal
            User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            Page<Payment> payments = paymentService.getPaymentsByUser(currentUser, pageable);
            
            List<PaymentDTO> paymentDTOs = payments.getContent().stream()
                    .map(this::convertToDTO)
                    .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", paymentDTOs);
            response.put("totalPages", payments.getTotalPages());
            response.put("totalElements", payments.getTotalElements());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting user payments: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error getting payments: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Thêm tín dụng cho user (cho testing)
     */
    @PostMapping("/admin/add-credit/{userId}")
    public ResponseEntity<?> addCreditForUser(
            @PathVariable Integer userId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false, defaultValue = "Admin credit top-up for testing") String description) {
        try {
            log.info("Admin adding {} credits to user ID: {}", amount, userId);
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            fsa.training.tutormatch.entity.Transaction transaction = 
                creditService.depositCredit(user, amount, description, "ADMIN_TOPUP_" + System.currentTimeMillis());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Credit added successfully");
            response.put("userId", userId);
            response.put("amount", amount);
            response.put("newBalance", user.getCreditBalance());
            response.put("transactionId", transaction.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error adding credit for user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error adding credit: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy payment theo ID
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(@PathVariable Integer paymentId) {
        try {
            Payment payment = paymentService.getPaymentById(paymentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payment", convertToDTO(payment));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting payment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error getting payment: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Convert Payment entity to DTO
     */
    private PaymentDTO convertToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setBookingId(payment.getBooking().getId());
        dto.setStudentId(payment.getStudent().getId());
        dto.setStudentName(payment.getStudent().getFullName());
        dto.setTutorId(payment.getTutor().getId());
        dto.setTutorName(payment.getTutor().getFullName());
        dto.setAmount(payment.getAmount());
        dto.setOriginalAmount(payment.getOriginalAmount());
        dto.setDiscountAmount(payment.getDiscountAmount());
        dto.setCouponCode(payment.getCoupon() != null ? payment.getCoupon().getCode() : null);
        dto.setPaymentMethod(payment.getPaymentMethod().name());
        dto.setStatus(payment.getStatus().name());
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentGateway(payment.getPaymentGateway());
        dto.setDescription(payment.getDescription());
        dto.setPaidAt(payment.getPaidAt() != null ? payment.getPaidAt().toString() : null);
        dto.setCreatedAt(payment.getCreatedAt().toString());
        
        return dto;
    }
}
