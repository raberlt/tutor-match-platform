package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {
    
    // Payment creation and management
    Payment createPayment(PaymentRequest request);
    Payment processCreditPayment(Integer paymentId);
    Payment createSePayQRPayment(Integer paymentId);
    Payment handleSePayCallback(String orderId, String status, String message);
    Payment checkSePayPaymentStatus(Integer paymentId);
    Payment refundPayment(Integer paymentId, String reason);
    
    // Payment queries
    List<Payment> getPaymentsByUser(Integer userId);
    Page<Payment> getPaymentsByUser(User user, Pageable pageable);
    List<Payment> getPaymentsByBooking(Integer bookingId);
    Payment getPaymentById(Integer paymentId);
    Payment getPaymentByTransactionId(String transactionId);
    
    // Payment statistics
    BigDecimal getTotalRevenue();
    BigDecimal getRevenueByStatus(PaymentStatus status);
    long getPaymentCountByStatus(PaymentStatus status);
    
    // Admin methods
    Page<Payment> getAllPayments(Pageable pageable);
    Page<Payment> getPaymentsByStatus(PaymentStatus status, Pageable pageable);
    Page<Payment> getPaymentsByStudent(User student, Pageable pageable);
    Page<Payment> getPaymentsByTutor(User tutor, Pageable pageable);
    BigDecimal sumAmountByStatus(PaymentStatus status);
    
    // Inner class for payment request
    class PaymentRequest {
        private Integer bookingId;
        private Integer studentId;
        private Integer tutorId;
        private BigDecimal amount;
        private BigDecimal originalAmount;
        private BigDecimal discountAmount;
        private PaymentMethod paymentMethod;
        private String description;
        private Integer couponId;
        
        // Getters and setters
        public Integer getBookingId() { return bookingId; }
        public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }
        
        public Integer getStudentId() { return studentId; }
        public void setStudentId(Integer studentId) { this.studentId = studentId; }
        
        public Integer getTutorId() { return tutorId; }
        public void setTutorId(Integer tutorId) { this.tutorId = tutorId; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public BigDecimal getOriginalAmount() { return originalAmount; }
        public void setOriginalAmount(BigDecimal originalAmount) { this.originalAmount = originalAmount; }
        
        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
        
        public PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Integer getCouponId() { return couponId; }
        public void setCouponId(Integer couponId) { this.couponId = couponId; }
    }
}
