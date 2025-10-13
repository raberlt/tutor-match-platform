package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.enums.TransactionType;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionService {
    
    // Create transactions
    Transaction createTransaction(Transaction transaction);
    Transaction createPaymentTransaction(Payment payment, User user, BigDecimal amount, String description);
    Transaction createRefundTransaction(Payment payment, User user, BigDecimal amount, String description);
    Transaction createDepositTransaction(User user, BigDecimal amount, String description);
    Transaction createWithdrawalTransaction(User user, BigDecimal amount, String description);
    
    // Update transactions
    Transaction updateTransaction(Integer transactionId, Transaction transaction);
    Transaction updateTransactionStatus(Integer transactionId, TransactionStatus status);
    Transaction processTransaction(Integer transactionId);
    
    // Get transactions
    Transaction getTransactionById(Integer transactionId);
    List<Transaction> getTransactionsByUser(User user);
    Page<Transaction> getTransactionsByUser(User user, Pageable pageable);
    List<Transaction> getTransactionsByBooking(Booking booking);
    Page<Transaction> getTransactionsByBooking(Booking booking, Pageable pageable);
    List<Transaction> getTransactionsByPayment(Payment payment);
    Page<Transaction> getTransactionsByPayment(Payment payment, Pageable pageable);
    
    // Get transactions by type
    List<Transaction> getTransactionsByType(TransactionType type);
    List<Transaction> getTransactionsByUserAndType(User user, TransactionType type);
    List<Transaction> getTransactionsByBookingAndType(Booking booking, TransactionType type);
    
    // Get transactions by method
    List<Transaction> getTransactionsByMethod(PaymentMethod method);
    List<Transaction> getTransactionsByUserAndMethod(User user, PaymentMethod method);
    
    // Get transactions by status
    List<Transaction> getTransactionsByStatus(TransactionStatus status);
    List<Transaction> getTransactionsByUserAndStatus(User user, TransactionStatus status);
    
    // Get transactions by date range
    List<Transaction> getTransactionsByDateRange(ZonedDateTime startDate, ZonedDateTime endDate);
    List<Transaction> getTransactionsByUserAndDateRange(User user, ZonedDateTime startDate, ZonedDateTime endDate);
    
    // Get transactions by reference
    Optional<Transaction> getTransactionByReferenceId(String referenceId);
    List<Transaction> getTransactionsByReferenceIdContaining(String referenceId);
    
    // Get transactions by transaction ID
    Optional<Transaction> getTransactionByTransactionId(String transactionId);
    
    // Count transactions
    long countTransactionsByUser(User user);
    long countTransactionsByUserAndType(User user, TransactionType type);
    long countTransactionsByUserAndStatus(User user, TransactionStatus status);
    long countTransactionsByBooking(Booking booking);
    long countTransactionsByPayment(Payment payment);
    
    // Sum transactions
    BigDecimal sumAmountByUserAndTypeAndStatus(User user, TransactionType type, TransactionStatus status);
    BigDecimal sumAmountByBookingAndTypeAndStatus(Booking booking, TransactionType type, TransactionStatus status);
    
    // Get recent transactions
    List<Transaction> getRecentTransactionsByUser(User user, Pageable pageable);
    List<Transaction> getRecentTransactionsByBooking(Booking booking, Pageable pageable);
    
    // Get all transactions
    List<Transaction> getAllTransactions();
    Page<Transaction> getAllTransactions(Pageable pageable);
    
    // Delete transactions
    void deleteTransaction(Integer transactionId);
    void deleteTransactionsByUser(User user);
    void deleteTransactionsByBooking(Booking booking);
    void deleteTransactionsByPayment(Payment payment);
}

