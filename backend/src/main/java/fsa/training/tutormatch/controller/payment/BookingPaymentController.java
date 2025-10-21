package fsa.training.tutormatch.controller.payment;

import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.PaymentStatus;
import fsa.training.tutormatch.enums.TransactionStatus;
import fsa.training.tutormatch.enums.TransactionType;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.PaymentRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.PaymentService;
import fsa.training.tutormatch.service.SepayService;
import fsa.training.tutormatch.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/booking-payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingPaymentController {

    private final PaymentService paymentService;
    private final SepayService sepayService;
    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Tạo thanh toán Sepay QR cho booking
     */
    @PostMapping("/{bookingId}/sepay-qr")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createSePayQRPayment(@PathVariable Integer bookingId, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Lấy booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Kiểm tra quyền sở hữu
            if (!booking.getStudent().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Bạn không có quyền thanh toán cho booking này"
                ));
            }

            // Kiểm tra trạng thái booking
            if (booking.getStatus() != fsa.training.tutormatch.enums.BookingStatus.PAYMENT_PENDING) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking không ở trạng thái chờ thanh toán"
                ));
            }

            // Tìm payment hiện tại hoặc tạo mới
            List<Payment> payments = paymentRepository.findByBookingId(bookingId);
            Payment payment;
            if (payments.isEmpty()) {
                throw new RuntimeException("Payment not found for booking");
            } else {
                payment = payments.get(0); // Lấy payment đầu tiên
            }

            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking đã được thanh toán"
                ));
            }

            // Tạo transaction PENDING cho thanh toán booking
            String transactionRef = Transaction.generateTransactionRef();
            Transaction transaction = new Transaction();
            transaction.setUser(user);
            transaction.setPayment(payment);
            transaction.setBooking(booking);
            transaction.setType(TransactionType.PAYMENT);
            transaction.setMethod(PaymentMethod.SEPAY_QR);
            transaction.setStatus(TransactionStatus.PENDING);
            transaction.setAmount(payment.getAmount());
            transaction.setDescription("Thanh toán booking #" + bookingId);
            transaction.setTransactionRef(transactionRef);
            transaction.setBalanceBefore(user.getCreditBalance());
            transaction = transactionService.createTransaction(transaction);

            // Tạo QR code Sepay
            String qrCodeUrl = sepayService.createPayment(user, payment.getAmount(), transactionRef);

            // Cập nhật payment với thông tin Sepay
            payment.setSepayOrderId(transactionRef);
            payment.setQrCodeUrl(qrCodeUrl);
            payment.setStatus(PaymentStatus.PROCESSING);
            payment.setPaymentMethod(PaymentMethod.SEPAY_QR);
            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo QR thanh toán thành công. Vui lòng quét mã để thanh toán.");
            response.put("bookingId", bookingId);
            response.put("paymentId", payment.getId());
            response.put("transactionRef", transactionRef);
            response.put("amount", payment.getAmount());
            response.put("qrCodeUrl", qrCodeUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error creating SePay QR payment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi tạo QR thanh toán: " + e.getMessage()
            ));
        }
    }

    /**
     * Kiểm tra trạng thái thanh toán booking
     */
    @GetMapping("/{bookingId}/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable Integer bookingId, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Lấy booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Kiểm tra quyền sở hữu
            if (!booking.getStudent().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Bạn không có quyền xem thông tin booking này"
                ));
            }

            // Lấy payment
            List<Payment> payments = paymentRepository.findByBookingId(bookingId);
            Payment payment;
            if (payments.isEmpty()) {
                throw new RuntimeException("Payment not found");
            } else {
                payment = payments.get(0); // Lấy payment đầu tiên
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookingId", bookingId);
            response.put("paymentId", payment.getId());
            response.put("status", payment.getStatus().name());
            response.put("amount", payment.getAmount());
            response.put("paymentMethod", payment.getPaymentMethod().name());
            response.put("transactionRef", payment.getSepayOrderId());
            response.put("qrCodeUrl", payment.getQrCodeUrl());
            response.put("paidAt", payment.getPaidAt());
            response.put("createdAt", payment.getCreatedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error checking payment status: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi kiểm tra trạng thái thanh toán: " + e.getMessage()
            ));
        }
    }

    /**
     * Thanh toán bằng tín dụng cho booking
     */
    @PostMapping("/{bookingId}/credit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> payWithCredit(@PathVariable Integer bookingId, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Lấy booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Kiểm tra quyền sở hữu
            if (!booking.getStudent().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Bạn không có quyền thanh toán cho booking này"
                ));
            }

            // Lấy payment
            List<Payment> payments = paymentRepository.findByBookingId(bookingId);
            Payment payment;
            if (payments.isEmpty()) {
                throw new RuntimeException("Payment not found");
            } else {
                payment = payments.get(0); // Lấy payment đầu tiên
            }

            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking đã được thanh toán"
                ));
            }

            // Xử lý thanh toán bằng tín dụng
            paymentService.processCreditPayment(payment.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thanh toán thành công");
            response.put("bookingId", bookingId);
            response.put("paymentId", payment.getId());
            response.put("amount", payment.getAmount());
            response.put("newBalance", user.getCreditBalance());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error processing credit payment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi thanh toán: " + e.getMessage()
            ));
        }
    }

    /**
     * Mô phỏng thanh toán thành công (cho testing)
     */
    @PostMapping("/{bookingId}/simulate-success")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> simulatePaymentSuccess(@PathVariable Integer bookingId, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Lấy booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Kiểm tra quyền sở hữu
            if (!booking.getStudent().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Bạn không có quyền thanh toán cho booking này"
                ));
            }

            // Lấy payment
            List<Payment> payments = paymentRepository.findByBookingId(bookingId);
            Payment payment;
            if (payments.isEmpty()) {
                throw new RuntimeException("Payment not found");
            } else {
                payment = payments.get(0); // Lấy payment đầu tiên
            }

            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking đã được thanh toán"
                ));
            }

            // Tìm transaction PENDING liên quan đến payment này
            Transaction transaction = transactionService.findByPaymentId(payment.getId())
                    .stream()
                    .filter(t -> t.getStatus() == TransactionStatus.PENDING)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No pending transaction found"));

            // Mô phỏng webhook thành công
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setProcessedAt(java.time.ZonedDateTime.now());
            transaction.setGatewayTransactionId("SIM_" + System.currentTimeMillis());
            transaction.setBalanceAfter(transaction.getBalanceBefore().subtract(transaction.getAmount()));
            transaction = transactionService.saveTransaction(transaction);

            // Cập nhật payment
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(java.time.ZonedDateTime.now());
            payment.setGatewayResponse("Simulated successful payment");
            paymentRepository.save(payment);

            // Cập nhật booking
            booking.setPaymentStatus(PaymentStatus.COMPLETED);
            booking.setStatus(fsa.training.tutormatch.enums.BookingStatus.PAYMENT_COMPLETED);
            bookingRepository.save(booking);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Mô phỏng thanh toán thành công");
            response.put("bookingId", bookingId);
            response.put("paymentId", payment.getId());
            response.put("transactionRef", transaction.getTransactionRef());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error simulating payment success: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi mô phỏng thanh toán: " + e.getMessage()
            ));
        }
    }
}
