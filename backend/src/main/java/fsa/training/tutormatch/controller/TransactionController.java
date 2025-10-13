package fsa.training.tutormatch.controller;

import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.enums.TransactionType;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.TransactionStatus;
import fsa.training.tutormatch.service.TransactionService;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.repository.BookingRepository;
import fsa.training.tutormatch.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

/*
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {
    
    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Transaction>> getAllTransactions(
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Getting all transactions");
        Page<Transaction> transactions = transactionService.getAllTransactions(pageable);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/user")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<Page<Transaction>> getUserTransactions(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Getting transactions for user: {}", authentication.getName());
        
        // Get user from authentication context
        User user = (User) authentication.getPrincipal();
        Page<Transaction> transactions = transactionService.getTransactionsByUser(user, pageable);
        
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Transaction>> getUserTransactions(
            @PathVariable Integer userId,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Getting transactions for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        Page<Transaction> transactions = transactionService.getTransactionsByUser(user, pageable);
        
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<List<Transaction>> getBookingTransactions(@PathVariable Integer bookingId) {
        log.info("Getting transactions for booking ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));
        List<Transaction> transactions = transactionService.getTransactionsByBooking(booking);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Transaction>> getPaymentTransactions(@PathVariable Integer paymentId) {
        log.info("Getting transactions for payment ID: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with ID: " + paymentId));
        List<Transaction> transactions = transactionService.getTransactionsByPayment(payment);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Transaction>> getTransactionsByType(@PathVariable TransactionType type) {
        log.info("Getting transactions by type: {}", type);
        
        List<Transaction> transactions = transactionService.getTransactionsByType(type);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/method/{method}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Transaction>> getTransactionsByMethod(@PathVariable PaymentMethod method) {
        log.info("Getting transactions by method: {}", method);
        
        List<Transaction> transactions = transactionService.getTransactionsByMethod(method);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Transaction>> getTransactionsByStatus(@PathVariable TransactionStatus status) {
        log.info("Getting transactions by status: {}", status);
        
        List<Transaction> transactions = transactionService.getTransactionsByStatus(status);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam ZonedDateTime startDate,
            @RequestParam ZonedDateTime endDate) {
        log.info("Getting transactions by date range: {} to {}", startDate, endDate);
        
        List<Transaction> transactions = transactionService.getTransactionsByDateRange(startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/reference/{referenceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Transaction> getTransactionByReferenceId(@PathVariable String referenceId) {
        log.info("Getting transaction by reference ID: {}", referenceId);
        
        return transactionService.getTransactionByReferenceId(referenceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/transaction-id/{transactionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Transaction> getTransactionByTransactionId(@PathVariable String transactionId) {
        log.info("Getting transaction by transaction ID: {}", transactionId);
        
        return transactionService.getTransactionByTransactionId(transactionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/stats/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransactionStats> getUserTransactionStats(@PathVariable Integer userId) {
        log.info("Getting transaction stats for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        TransactionStats stats = new TransactionStats();
        stats.setTotalTransactions(transactionService.countTransactionsByUser(user));
        stats.setTotalPayments(transactionService.countTransactionsByUserAndType(user, TransactionType.PAYMENT));
        stats.setTotalRefunds(transactionService.countTransactionsByUserAndType(user, TransactionType.REFUND));
        stats.setTotalDeposits(transactionService.countTransactionsByUserAndType(user, TransactionType.DEPOSIT));
        stats.setTotalWithdrawals(transactionService.countTransactionsByUserAndType(user, TransactionType.WITHDRAWAL));
        
        // Calculate amounts
        stats.setTotalPaid(transactionService.sumAmountByUserAndTypeAndStatus(user, TransactionType.PAYMENT, TransactionStatus.COMPLETED));
        stats.setTotalRefunded(transactionService.sumAmountByUserAndTypeAndStatus(user, TransactionType.REFUND, TransactionStatus.COMPLETED));
        stats.setTotalDeposited(transactionService.sumAmountByUserAndTypeAndStatus(user, TransactionType.DEPOSIT, TransactionStatus.COMPLETED));
        stats.setTotalWithdrawn(transactionService.sumAmountByUserAndTypeAndStatus(user, TransactionType.WITHDRAWAL, TransactionStatus.COMPLETED));
        
        return ResponseEntity.ok(stats);
    }
    
    @PutMapping("/{transactionId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Transaction> updateTransactionStatus(
            @PathVariable Integer transactionId,
            @RequestParam TransactionStatus status) {
        log.info("Updating transaction status: {} to {}", transactionId, status);
        
        Transaction transaction = transactionService.updateTransactionStatus(transactionId, status);
        return ResponseEntity.ok(transaction);
    }
    
    @PostMapping("/{transactionId}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Transaction> processTransaction(@PathVariable Integer transactionId) {
        log.info("Processing transaction: {}", transactionId);
        
        Transaction transaction = transactionService.processTransaction(transactionId);
        return ResponseEntity.ok(transaction);
    }
    
    @DeleteMapping("/{transactionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Integer transactionId) {
        log.info("Deleting transaction: {}", transactionId);
        
        transactionService.deleteTransaction(transactionId);
        return ResponseEntity.noContent().build();
    }
    
    // DTO for transaction statistics
    public static class TransactionStats {
        private long totalTransactions;
        private long totalPayments;
        private long totalRefunds;
        private long totalDeposits;
        private long totalWithdrawals;
        private BigDecimal totalPaid;
        private BigDecimal totalRefunded;
        private BigDecimal totalDeposited;
        private BigDecimal totalWithdrawn;
        
        // Getters and setters
        public long getTotalTransactions() { return totalTransactions; }
        public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }
        
        public long getTotalPayments() { return totalPayments; }
        public void setTotalPayments(long totalPayments) { this.totalPayments = totalPayments; }
        
        public long getTotalRefunds() { return totalRefunds; }
        public void setTotalRefunds(long totalRefunds) { this.totalRefunds = totalRefunds; }
        
        public long getTotalDeposits() { return totalDeposits; }
        public void setTotalDeposits(long totalDeposits) { this.totalDeposits = totalDeposits; }
        
        public long getTotalWithdrawals() { return totalWithdrawals; }
        public void setTotalWithdrawals(long totalWithdrawals) { this.totalWithdrawals = totalWithdrawals; }
        
        public BigDecimal getTotalPaid() { return totalPaid; }
        public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
        
        public BigDecimal getTotalRefunded() { return totalRefunded; }
        public void setTotalRefunded(BigDecimal totalRefunded) { this.totalRefunded = totalRefunded; }
        
        public BigDecimal getTotalDeposited() { return totalDeposited; }
        public void setTotalDeposited(BigDecimal totalDeposited) { this.totalDeposited = totalDeposited; }
        
        public BigDecimal getTotalWithdrawn() { return totalWithdrawn; }
        public void setTotalWithdrawn(BigDecimal totalWithdrawn) { this.totalWithdrawn = totalWithdrawn; }
    }
}
*/

