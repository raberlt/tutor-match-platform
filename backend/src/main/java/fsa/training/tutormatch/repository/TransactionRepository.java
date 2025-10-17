package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.enums.TransactionType;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    
    // Find by user
    List<Transaction> findByUserOrderByCreatedAtDesc(User user);
    Page<Transaction> findByUser(User user, Pageable pageable);
    
    // Find by booking
    List<Transaction> findByBookingOrderByCreatedAtDesc(Booking booking);
    Page<Transaction> findByBooking(Booking booking, Pageable pageable);
    
    // Find by payment
    List<Transaction> findByPaymentOrderByCreatedAtDesc(Payment payment);
    Page<Transaction> findByPayment(Payment payment, Pageable pageable);
    
    // Find by transaction type
    List<Transaction> findByTypeOrderByCreatedAtDesc(TransactionType type);
    List<Transaction> findByUserAndTypeOrderByCreatedAtDesc(User user, TransactionType type);
    List<Transaction> findByBookingAndTypeOrderByCreatedAtDesc(Booking booking, TransactionType type);
    
    // Find by payment method
    List<Transaction> findByMethodOrderByCreatedAtDesc(PaymentMethod method);
    List<Transaction> findByUserAndMethodOrderByCreatedAtDesc(User user, PaymentMethod method);
    
    // Find by status
    List<Transaction> findByStatusOrderByCreatedAtDesc(TransactionStatus status);
    List<Transaction> findByUserAndStatusOrderByCreatedAtDesc(User user, TransactionStatus status);
    
    // Find by date range
    List<Transaction> findByCreatedAtBetweenOrderByCreatedAtDesc(ZonedDateTime startDate, ZonedDateTime endDate);
    List<Transaction> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(User user, ZonedDateTime startDate, ZonedDateTime endDate);
    
    // Find by transaction reference
    Optional<Transaction> findByTransactionRef(String transactionRef);
    List<Transaction> findByTransactionRefContainingIgnoreCase(String transactionRef);
    
    // Find by gateway transaction ID
    Optional<Transaction> findByGatewayTransactionId(String gatewayTransactionId);
    
    // Find by status, amount and time range (for Sepay webhook)
    List<Transaction> findByStatusAndAmountAndCreatedAtAfter(TransactionStatus status, BigDecimal amount, ZonedDateTime createdAt);
    
    // Complex queries
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.status = :status ORDER BY t.createdAt DESC")
    List<Transaction> findByUserAndTypeAndStatus(@Param("user") User user, @Param("type") TransactionType type, @Param("status") TransactionStatus status);
    
    @Query("SELECT t FROM Transaction t WHERE t.booking = :booking AND t.type = :type AND t.status = :status ORDER BY t.createdAt DESC")
    List<Transaction> findByBookingAndTypeAndStatus(@Param("booking") Booking booking, @Param("type") TransactionType type, @Param("status") TransactionStatus status);
    
    // Count queries
    long countByUser(User user);
    long countByUserAndType(User user, TransactionType type);
    long countByUserAndStatus(User user, TransactionStatus status);
    long countByBooking(Booking booking);
    long countByPayment(Payment payment);
    
    // Sum queries
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.status = :status")
    Double sumAmountByUserAndTypeAndStatus(@Param("user") User user, @Param("type") TransactionType type, @Param("status") TransactionStatus status);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.booking = :booking AND t.type = :type AND t.status = :status")
    Double sumAmountByBookingAndTypeAndStatus(@Param("booking") Booking booking, @Param("type") TransactionType type, @Param("status") TransactionStatus status);
    
    // Find recent transactions
    @Query("SELECT t FROM Transaction t WHERE t.user = :user ORDER BY t.createdAt DESC")
    List<Transaction> findRecentTransactionsByUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT t FROM Transaction t WHERE t.booking = :booking ORDER BY t.createdAt DESC")
    List<Transaction> findRecentTransactionsByBooking(@Param("booking") Booking booking, Pageable pageable);
    
    // Delete methods
    void deleteByUser(User user);
    void deleteByBooking(Booking booking);
    void deleteByPayment(Payment payment);
}
