package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.*;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.PaymentStatus;
import fsa.training.tutormatch.repository.*;
import fsa.training.tutormatch.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final CreditService creditService;
    private final SePayService sePayService;
    private final TransactionService transactionService;
    
    @Override
    @Transactional
    public Payment createPayment(PaymentRequest request) {
        log.info("Creating payment for booking: {}, amount: {}, method: {}", 
                request.getBookingId(), request.getAmount(), request.getPaymentMethod());
        
        // Validate booking exists
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        
        // Validate users exist
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        
        User tutor = userRepository.findById(request.getTutorId())
                .orElseThrow(() -> new IllegalArgumentException("Tutor not found"));
        
        // Create payment entity
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setStudent(student);
        payment.setTutor(tutor);
        payment.setAmount(request.getAmount());
        payment.setOriginalAmount(request.getOriginalAmount() != null ? request.getOriginalAmount() : request.getAmount());
        payment.setDiscountAmount(request.getDiscountAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setDescription(request.getDescription());
        
        // Set coupon if provided
        if (request.getCouponId() != null) {
            Coupon coupon = couponRepository.findById(request.getCouponId())
                    .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
            payment.setCoupon(coupon);
        }
        
        // Generate transaction ID
        payment.setTransactionId(UUID.randomUUID().toString());
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment created with ID: {}", savedPayment.getId());
        
        // Create transaction record for audit trail
        transactionService.createPaymentTransaction(savedPayment, student, savedPayment.getAmount(), 
                "Payment for booking #" + savedPayment.getBooking().getId());
        
        return savedPayment;
    }
    
    @Override
    @Transactional
    public Payment processCreditPayment(Integer paymentId) {
        log.info("Processing credit payment for payment ID: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        
        if (payment.getPaymentMethod() != PaymentMethod.CREDIT) {
            throw new IllegalArgumentException("Payment method is not CREDIT");
        }
        
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Payment is not in PENDING status");
        }
        
        // Process credit payment
        User student = payment.getStudent();
        
        // Check if student has enough credit
        if (!creditService.hasEnoughCredit(student, payment.getAmount())) {
            throw new IllegalArgumentException("Insufficient credit balance");
        }
        
        // Deduct credit from student using new Transaction system
        Transaction transaction = transactionService.createPaymentTransaction(
                payment, 
                student, 
                payment.getAmount(), 
                "Payment for booking #" + payment.getBooking().getId()
        );
        
        // Process the transaction
        transactionService.processTransaction(transaction.getId());
        
        // Update payment status
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(ZonedDateTime.now());

        // Update booking status to reflect completed payment
        Booking booking = payment.getBooking();
        if (booking != null) {
            booking.setPaymentStatus(PaymentStatus.COMPLETED);
            // Nếu muốn hiển thị rõ đã thanh toán, có thể đặt trạng thái nghiệp vụ tương ứng
            booking.setStatus(fsa.training.tutormatch.enums.BookingStatus.PAYMENT_COMPLETED);
            bookingRepository.save(booking);
        }

        Payment savedPayment = paymentRepository.save(payment);
        
        log.info("Credit payment processed successfully for payment ID: {}", paymentId);
        return savedPayment;
    }
    
    @Override
    @Transactional
    public Payment createSePayQRPayment(Integer paymentId) {
        log.info("Creating SePay QR payment for payment ID: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        
        if (payment.getPaymentMethod() != PaymentMethod.SEPAY_QR) {
            throw new IllegalArgumentException("Payment method is not SEPAY_QR");
        }
        
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Payment is not in PENDING status");
        }
        
        // Create SePay QR payment
        String orderId = "TUTOR_" + payment.getId() + "_" + System.currentTimeMillis();
        String description = "Payment for booking #" + payment.getBooking().getId();
        
        SePayService.SePayQRResponse qrResponse = sePayService.createQRPayment(
                orderId, 
                payment.getAmount(), 
                description,
                "http://localhost:8080/api/payments/sepay/callback"
        );
        
        if (qrResponse.isSuccess()) {
            // Update payment with QR info
            payment.setSepayOrderId(orderId);
            payment.setQrCodeUrl(qrResponse.getQrCodeUrl());
            payment.setStatus(PaymentStatus.PROCESSING);
            payment.setGatewayResponse("QR code created successfully");
            
            Payment savedPayment = paymentRepository.save(payment);
            log.info("SePay QR payment created successfully for payment ID: {}", paymentId);
            return savedPayment;
        } else {
            throw new RuntimeException("Failed to create SePay QR payment: " + qrResponse.getMessage());
        }
    }
    
    @Override
    @Transactional
    public Payment checkSePayPaymentStatus(Integer paymentId) {
        log.info("Checking SePay payment status for payment ID: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        
        if (payment.getPaymentMethod() != PaymentMethod.SEPAY_QR) {
            throw new IllegalArgumentException("Payment method is not SEPAY_QR");
        }
        
        if (payment.getSepayOrderId() == null) {
            throw new IllegalArgumentException("SePay order ID not found");
        }
        
        // Check status with SePay
        SePayService.SePayStatusResponse statusResponse = sePayService.checkPaymentStatus(
                payment.getSepayOrderId()
        );
        
        if (statusResponse.isSuccess()) {
            // Update payment status based on SePay response
            if ("COMPLETED".equals(statusResponse.getStatus())) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setPaidAt(ZonedDateTime.now());
                payment.setGatewayResponse("Payment completed via SePay");
                
                // Update booking status
                Booking booking = payment.getBooking();
                booking.setPaymentStatus(PaymentStatus.COMPLETED);
                booking.setStatus(fsa.training.tutormatch.enums.BookingStatus.PAYMENT_COMPLETED);
                bookingRepository.save(booking);
                
            } else if ("FAILED".equals(statusResponse.getStatus())) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setGatewayResponse("Payment failed via SePay: " + statusResponse.getMessage());
            }
            
            Payment savedPayment = paymentRepository.save(payment);
            log.info("SePay payment status updated for payment ID: {}", paymentId);
            return savedPayment;
        } else {
            throw new RuntimeException("Failed to check SePay payment status: " + statusResponse.getMessage());
        }
    }
    
    @Override
    @Transactional
    public Payment handleSePayCallback(String orderId, String status, String message) {
        log.info("Processing SePay callback for order: {}, status: {}, message: {}", orderId, status, message);
        
        // Find payment by SePay order ID
        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> orderId.equals(p.getSepayOrderId()))
                .toList();
        
        if (payments.isEmpty()) {
            throw new IllegalArgumentException("Payment not found for order ID: " + orderId);
        }
        
        Payment payment = payments.get(0);
        
        // Update payment status based on callback
        if ("COMPLETED".equals(status)) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(ZonedDateTime.now());
            payment.setGatewayResponse("Payment completed via SePay callback");
            
            // Update booking status
            Booking booking = payment.getBooking();
            booking.setPaymentStatus(PaymentStatus.COMPLETED);
            booking.setStatus(fsa.training.tutormatch.enums.BookingStatus.PAYMENT_COMPLETED);
            bookingRepository.save(booking);
            
        } else if ("FAILED".equals(status)) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayResponse("Payment failed via SePay callback");
        }
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("SePay callback processed for payment ID: {}", payment.getId());
        return savedPayment;
    }
    
    @Override
    @Transactional
    public Payment refundPayment(Integer paymentId, String reason) {
        log.info("Processing refund for payment ID: {}, reason: {}", paymentId, reason);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new IllegalArgumentException("Only completed payments can be refunded");
        }
        
        // Process refund based on payment method
        if (payment.getPaymentMethod() == PaymentMethod.CREDIT) {
            // Refund to credit using new Transaction system
            String description = "Refund for payment #" + payment.getId() + ": " + reason;
            
            Transaction refundTransaction = transactionService.createRefundTransaction(
                    payment, 
                    payment.getStudent(), 
                    payment.getAmount(), 
                    description
            );
            
            // Process the refund transaction
            transactionService.processTransaction(refundTransaction.getId());
            
        } else if (payment.getPaymentMethod() == PaymentMethod.SEPAY_QR) {
            // Refund via SePay
            SePayService.SePayRefundResponse refundResponse = sePayService.refundPayment(
                    payment.getSepayOrderId(), 
                    payment.getAmount(), 
                    reason
            );
            
            if (!refundResponse.isSuccess()) {
                throw new RuntimeException("Failed to process SePay refund: " + refundResponse.getMessage());
            }
            
            // Create transaction record for SePay refund
            Transaction refundTransaction = transactionService.createRefundTransaction(
                    payment, 
                    payment.getStudent(), 
                    payment.getAmount(), 
                    "SePay refund: " + reason
            );
            
            transactionService.processTransaction(refundTransaction.getId());
        }
        
        // Update payment status
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setGatewayResponse("Refund processed: " + reason);
        
        // Update booking status
        Booking booking = payment.getBooking();
        booking.setPaymentStatus(PaymentStatus.REFUNDED);
        booking.setStatus(fsa.training.tutormatch.enums.BookingStatus.REFUNDED);
        bookingRepository.save(booking);
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Refund processed successfully for payment ID: {}", paymentId);
        return savedPayment;
    }
    
    @Override
    public Payment getPaymentById(Integer paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
    }
    
    public List<Payment> getPaymentsByUser(User user) {
        return paymentRepository.findByStudentOrderByCreatedAtDesc(user);
    }
    
    @Override
    public List<Payment> getPaymentsByUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return getPaymentsByUser(user);
    }
    
    @Override
    public List<Payment> getPaymentsByBooking(Integer bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }
    
    @Override
    public Payment getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with transaction ID: " + transactionId));
    }
    
    @Override
    public Page<Payment> getPaymentsByUser(User user, Pageable pageable) {
        return paymentRepository.findByStudent(user, pageable);
    }
    
    @Override
    public Page<Payment> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable);
    }
    
    @Override
    public Page<Payment> getPaymentsByStatus(PaymentStatus status, Pageable pageable) {
        return paymentRepository.findByStatus(status, pageable);
    }
    
    @Override
    public Page<Payment> getPaymentsByStudent(User student, Pageable pageable) {
        return paymentRepository.findByStudent(student, pageable);
    }
    
    @Override
    public Page<Payment> getPaymentsByTutor(User tutor, Pageable pageable) {
        return paymentRepository.findByTutor(tutor, pageable);
    }
    
    @Override
    public BigDecimal getTotalRevenue() {
        return paymentRepository.sumAmountByStatus(PaymentStatus.COMPLETED);
    }
    
    @Override
    public BigDecimal getRevenueByStatus(PaymentStatus status) {
        return paymentRepository.sumAmountByStatus(status);
    }
    
    @Override
    public long getPaymentCountByStatus(PaymentStatus status) {
        return paymentRepository.countByStatus(status);
    }
    
    @Override
    public BigDecimal sumAmountByStatus(PaymentStatus status) {
        return paymentRepository.sumAmountByStatus(status);
    }
}
