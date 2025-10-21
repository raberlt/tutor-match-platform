package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.Booking;
import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.enums.TransactionType;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.TransactionStatus;
import fsa.training.tutormatch.repository.TransactionRepository;
import fsa.training.tutormatch.service.TransactionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class TransactionServiceImpl implements TransactionService {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Override
    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        log.info("Creating transaction: type={}, method={}, amount={}, user={}", 
                transaction.getType(), transaction.getMethod(), transaction.getAmount(), transaction.getUser().getId());
        
        // Generate gateway transaction ID if not provided
        if (transaction.getGatewayTransactionId() == null) {
            transaction.setGatewayTransactionId(UUID.randomUUID().toString());
        }
        
        // Set created timestamp
        transaction.setCreatedAt(ZonedDateTime.now());
        
        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction created with ID: {}", savedTransaction.getId());
        
        return savedTransaction;
    }
    
    @Override
    @Transactional
    public Transaction createPaymentTransaction(Payment payment, User user, BigDecimal amount, String description) {
        log.info("Creating payment transaction for payment: {}, user: {}, amount: {}", 
                payment.getId(), user.getId(), amount);
        
        Transaction transaction = new Transaction();
        transaction.setPayment(payment);
        transaction.setUser(user);
        transaction.setBooking(payment.getBooking());
        transaction.setType(TransactionType.PAYMENT);
        transaction.setMethod(payment.getPaymentMethod());
        transaction.setAmount(amount);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setDescription(description);
        transaction.setTransactionRef("PAYMENT_" + payment.getId());
        
        return createTransaction(transaction);
    }
    
    @Override
    @Transactional
    public Transaction createRefundTransaction(Payment payment, User user, BigDecimal amount, String description) {
        log.info("Creating refund transaction for payment: {}, user: {}, amount: {}", 
                payment.getId(), user.getId(), amount);
        
        Transaction transaction = new Transaction();
        transaction.setPayment(payment);
        transaction.setUser(user);
        transaction.setBooking(payment.getBooking());
        transaction.setType(TransactionType.REFUND);
        transaction.setMethod(payment.getPaymentMethod());
        transaction.setAmount(amount.negate()); // Negative amount for refund
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setDescription(description);
        transaction.setTransactionRef("REFUND_" + payment.getId());
        
        return createTransaction(transaction);
    }
    
    @Override
    @Transactional
    public Transaction createDepositTransaction(User user, BigDecimal amount, String description) {
        log.info("Creating deposit transaction for user: {}, amount: {}", user.getId(), amount);
        
        Transaction transaction = new Transaction();
        transaction.setPayment(null); // No payment for deposit
        transaction.setUser(user);
        transaction.setBooking(null); // No booking for deposit
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setMethod(PaymentMethod.CREDIT);
        transaction.setAmount(amount);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setDescription(description);
        transaction.setTransactionRef("DEPOSIT_" + user.getId() + "_" + System.currentTimeMillis());
        
        return createTransaction(transaction);
    }
    
    @Override
    @Transactional
    public Transaction createWithdrawalTransaction(User user, BigDecimal amount, String description) {
        log.info("Creating withdrawal transaction for user: {}, amount: {}", user.getId(), amount);
        
        Transaction transaction = new Transaction();
        transaction.setPayment(null); // No payment for withdrawal
        transaction.setUser(user);
        transaction.setBooking(null); // No booking for withdrawal
        transaction.setType(TransactionType.WITHDRAWAL);
        transaction.setMethod(PaymentMethod.CREDIT);
        transaction.setAmount(amount.negate()); // Negative amount for withdrawal
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setDescription(description);
        transaction.setTransactionRef("WITHDRAWAL_" + user.getId() + "_" + System.currentTimeMillis());
        
        return createTransaction(transaction);
    }
    
    @Override
    @Transactional
    public Transaction updateTransaction(Integer transactionId, Transaction transaction) {
        log.info("Updating transaction: {}", transactionId);
        
        Transaction existingTransaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        
        // Update fields
        existingTransaction.setType(transaction.getType());
        existingTransaction.setMethod(transaction.getMethod());
        existingTransaction.setStatus(transaction.getStatus());
        existingTransaction.setAmount(transaction.getAmount());
        existingTransaction.setDescription(transaction.getDescription());
        existingTransaction.setTransactionRef(transaction.getTransactionRef());
        existingTransaction.setGatewayTransactionId(transaction.getGatewayTransactionId());
        
        Transaction savedTransaction = transactionRepository.save(existingTransaction);
        log.info("Transaction updated: {}", transactionId);
        
        return savedTransaction;
    }
    
    @Override
    @Transactional
    public Transaction updateTransactionStatus(Integer transactionId, TransactionStatus status) {
        log.info("Updating transaction status: {} to {}", transactionId, status);
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        
        transaction.setStatus(status);
        
        if (status == TransactionStatus.COMPLETED) {
            transaction.setProcessedAt(ZonedDateTime.now());
        }
        
        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction status updated: {} to {}", transactionId, status);
        
        return savedTransaction;
    }
    
    @Override
    @Transactional
    public Transaction processTransaction(Integer transactionId) {
        log.info("Processing transaction: {}", transactionId);
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalArgumentException("Transaction is not in PENDING status");
        }
        
        // Process based on transaction type
        switch (transaction.getType()) {
            case PAYMENT:
                // Process payment transaction
                transaction.setStatus(TransactionStatus.COMPLETED);
                transaction.setProcessedAt(ZonedDateTime.now());
                break;
            case REFUND:
                // Process refund transaction
                transaction.setStatus(TransactionStatus.COMPLETED);
                transaction.setProcessedAt(ZonedDateTime.now());
                break;
            case DEPOSIT:
                // Process deposit transaction
                transaction.setStatus(TransactionStatus.COMPLETED);
                transaction.setProcessedAt(ZonedDateTime.now());
                break;
            case WITHDRAWAL:
                // Process withdrawal transaction
                transaction.setStatus(TransactionStatus.COMPLETED);
                transaction.setProcessedAt(ZonedDateTime.now());
                break;
            default:
                throw new IllegalArgumentException("Unknown transaction type: " + transaction.getType());
        }
        
        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction processed: {}", transactionId);
        
        return savedTransaction;
    }
    
    @Override
    @Transactional
    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }
    
    @Override
    public Transaction getTransactionById(Integer transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
    }
    
    @Override
    public List<Transaction> getTransactionsByUser(User user) {
        return transactionRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    @Override
    public Page<Transaction> getTransactionsByUser(User user, Pageable pageable) {
        return transactionRepository.findByUser(user, pageable);
    }
    
    @Override
    public List<Transaction> getTransactionsByBooking(Booking booking) {
        return transactionRepository.findByBookingOrderByCreatedAtDesc(booking);
    }
    
    @Override
    public Page<Transaction> getTransactionsByBooking(Booking booking, Pageable pageable) {
        return transactionRepository.findByBooking(booking, pageable);
    }
    
    @Override
    public List<Transaction> getTransactionsByPayment(Payment payment) {
        return transactionRepository.findByPaymentOrderByCreatedAtDesc(payment);
    }
    
    @Override
    public Page<Transaction> getTransactionsByPayment(Payment payment, Pageable pageable) {
        return transactionRepository.findByPayment(payment, pageable);
    }
    
    @Override
    public List<Transaction> findByPaymentId(Integer paymentId) {
        return transactionRepository.findByPaymentId(paymentId);
    }
    
    @Override
    public List<Transaction> getTransactionsByType(TransactionType type) {
        return transactionRepository.findByTypeOrderByCreatedAtDesc(type);
    }
    
    @Override
    public List<Transaction> getTransactionsByUserAndType(User user, TransactionType type) {
        return transactionRepository.findByUserAndTypeOrderByCreatedAtDesc(user, type);
    }
    
    @Override
    public List<Transaction> getTransactionsByBookingAndType(Booking booking, TransactionType type) {
        return transactionRepository.findByBookingAndTypeOrderByCreatedAtDesc(booking, type);
    }
    
    @Override
    public List<Transaction> getTransactionsByMethod(PaymentMethod method) {
        return transactionRepository.findByMethodOrderByCreatedAtDesc(method);
    }
    
    @Override
    public List<Transaction> getTransactionsByUserAndMethod(User user, PaymentMethod method) {
        return transactionRepository.findByUserAndMethodOrderByCreatedAtDesc(user, method);
    }
    
    @Override
    public List<Transaction> getTransactionsByStatus(TransactionStatus status) {
        return transactionRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    @Override
    public List<Transaction> getTransactionsByUserAndStatus(User user, TransactionStatus status) {
        return transactionRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status);
    }
    
    @Override
    public List<Transaction> getTransactionsByDateRange(ZonedDateTime startDate, ZonedDateTime endDate) {
        return transactionRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);
    }
    
    @Override
    public List<Transaction> getTransactionsByUserAndDateRange(User user, ZonedDateTime startDate, ZonedDateTime endDate) {
        return transactionRepository.findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(user, startDate, endDate);
    }
    
    @Override
    public Optional<Transaction> getTransactionByTransactionRef(String transactionRef) {
        return transactionRepository.findByTransactionRef(transactionRef);
    }
    
    @Override
    public List<Transaction> getTransactionsByTransactionRefContaining(String transactionRef) {
        return transactionRepository.findByTransactionRefContainingIgnoreCase(transactionRef);
    }
    
    @Override
    public Optional<Transaction> getTransactionByGatewayTransactionId(String gatewayTransactionId) {
        return transactionRepository.findByGatewayTransactionId(gatewayTransactionId);
    }
    
    @Override
    public long countTransactionsByUser(User user) {
        return transactionRepository.countByUser(user);
    }
    
    @Override
    public long countTransactionsByUserAndType(User user, TransactionType type) {
        return transactionRepository.countByUserAndType(user, type);
    }
    
    @Override
    public long countTransactionsByUserAndStatus(User user, TransactionStatus status) {
        return transactionRepository.countByUserAndStatus(user, status);
    }
    
    @Override
    public long countTransactionsByBooking(Booking booking) {
        return transactionRepository.countByBooking(booking);
    }
    
    @Override
    public long countTransactionsByPayment(Payment payment) {
        return transactionRepository.countByPayment(payment);
    }
    
    @Override
    public BigDecimal sumAmountByUserAndTypeAndStatus(User user, TransactionType type, TransactionStatus status) {
        Double sum = transactionRepository.sumAmountByUserAndTypeAndStatus(user, type, status);
        return sum != null ? BigDecimal.valueOf(sum) : BigDecimal.ZERO;
    }
    
    @Override
    public BigDecimal sumAmountByBookingAndTypeAndStatus(Booking booking, TransactionType type, TransactionStatus status) {
        Double sum = transactionRepository.sumAmountByBookingAndTypeAndStatus(booking, type, status);
        return sum != null ? BigDecimal.valueOf(sum) : BigDecimal.ZERO;
    }
    
    @Override
    public List<Transaction> getRecentTransactionsByUser(User user, Pageable pageable) {
        return transactionRepository.findRecentTransactionsByUser(user, pageable);
    }
    
    @Override
    public List<Transaction> getRecentTransactionsByBooking(Booking booking, Pageable pageable) {
        return transactionRepository.findRecentTransactionsByBooking(booking, pageable);
    }
    
    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
    
    @Override
    public Page<Transaction> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable);
    }
    
    @Override
    @Transactional
    public void deleteTransaction(Integer transactionId) {
        log.info("Deleting transaction: {}", transactionId);
        
        if (!transactionRepository.existsById(transactionId)) {
            throw new IllegalArgumentException("Transaction not found");
        }
        
        transactionRepository.deleteById(transactionId);
        log.info("Transaction deleted: {}", transactionId);
    }
    
    @Override
    @Transactional
    public void deleteTransactionsByUser(User user) {
        log.info("Deleting all transactions for user: {}", user.getId());
        transactionRepository.deleteByUser(user);
    }
    
    @Override
    @Transactional
    public void deleteTransactionsByBooking(Booking booking) {
        log.info("Deleting all transactions for booking: {}", booking.getId());
        transactionRepository.deleteByBooking(booking);
    }
    
    @Override
    @Transactional
    public void deleteTransactionsByPayment(Payment payment) {
        log.info("Deleting all transactions for payment: {}", payment.getId());
        transactionRepository.deleteByPayment(payment);
    }
}

