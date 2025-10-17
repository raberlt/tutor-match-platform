package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.enums.TransactionType;
import fsa.training.tutormatch.enums.PaymentMethod;
import fsa.training.tutormatch.enums.TransactionStatus;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.CreditService;
import fsa.training.tutormatch.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditServiceImpl implements CreditService {
    
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    
    @Override
    public BigDecimal getCurrentBalance(User user) {
        return user.getCreditBalance();
    }
    
    @Override
    public boolean hasEnoughCredit(User user, BigDecimal amount) {
        return user.hasEnoughCredit(amount);
    }
    
    @Override
    @Transactional
    public Transaction depositCredit(User user, BigDecimal amount, String description, String transactionRef) {
        log.info("Depositing {} credits to user {}", amount, user.getId());
        
        // Get balance before transaction
        BigDecimal balanceBefore = user.getCreditBalance();
        
        // Add credit to user
        user.addCredit(amount);
        userRepository.save(user);
        
        // Get balance after transaction
        BigDecimal balanceAfter = user.getCreditBalance();
        
        // Create new Transaction record
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setMethod(PaymentMethod.CREDIT);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setTransactionRef(transactionRef != null ? transactionRef : Transaction.generateTransactionRef());
        transaction.setGatewayTransactionId("CREDIT_" + System.currentTimeMillis());
        
        Transaction savedTransaction = transactionService.createTransaction(transaction);
        log.info("Credit deposit successful. Transaction ID: {}", savedTransaction.getId());
        
        return savedTransaction;
    }
    
    @Override
    @Transactional
    public Transaction withdrawCredit(User user, BigDecimal amount, String description, String transactionRef) {
        log.info("Withdrawing {} credits from user {}", amount, user.getId());
        
        // Check if user has enough credit
        if (!user.hasEnoughCredit(amount)) {
            throw new IllegalArgumentException("Insufficient credit balance");
        }
        
        // Get balance before transaction
        BigDecimal balanceBefore = user.getCreditBalance();
        
        // Deduct credit from user
        user.deductCredit(amount);
        userRepository.save(user);
        
        // Get balance after transaction
        BigDecimal balanceAfter = user.getCreditBalance();
        
        // Create new Transaction record
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(TransactionType.WITHDRAWAL);
        transaction.setMethod(PaymentMethod.CREDIT);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setTransactionRef(transactionRef != null ? transactionRef : Transaction.generateTransactionRef());
        transaction.setGatewayTransactionId("CREDIT_" + System.currentTimeMillis());
        
        Transaction savedTransaction = transactionService.createTransaction(transaction);
        log.info("Credit withdrawal successful. Transaction ID: {}", savedTransaction.getId());
        
        return savedTransaction;
    }
    
    @Override
    @Transactional
    public Transaction payWithCredit(User user, BigDecimal amount, String description, String transactionRef) {
        log.info("Processing payment of {} credits for user {}", amount, user.getId());
        
        // Check if user has enough credit
        if (!user.hasEnoughCredit(amount)) {
            throw new IllegalArgumentException("Insufficient credit balance");
        }
        
        // Get balance before transaction
        BigDecimal balanceBefore = user.getCreditBalance();
        
        // Deduct credit from user
        user.deductCredit(amount);
        userRepository.save(user);
        
        // Get balance after transaction
        BigDecimal balanceAfter = user.getCreditBalance();
        
        // Create new Transaction record
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(TransactionType.PAYMENT);
        transaction.setMethod(PaymentMethod.CREDIT);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setTransactionRef(transactionRef != null ? transactionRef : Transaction.generateTransactionRef());
        transaction.setGatewayTransactionId("CREDIT_" + System.currentTimeMillis());
        
        Transaction savedTransaction = transactionService.createTransaction(transaction);
        log.info("Credit payment successful. Transaction ID: {}", savedTransaction.getId());
        
        return savedTransaction;
    }
    
    @Override
    @Transactional
    public Transaction refundCredit(User user, BigDecimal amount, String description, String transactionRef) {
        log.info("Refunding {} credits to user {}", amount, user.getId());
        
        // Get balance before transaction
        BigDecimal balanceBefore = user.getCreditBalance();
        
        // Add credit to user
        user.addCredit(amount);
        userRepository.save(user);
        
        // Get balance after transaction
        BigDecimal balanceAfter = user.getCreditBalance();
        
        // Create new Transaction record
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(TransactionType.REFUND);
        transaction.setMethod(PaymentMethod.CREDIT);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setTransactionRef(transactionRef != null ? transactionRef : Transaction.generateTransactionRef());
        transaction.setGatewayTransactionId("CREDIT_" + System.currentTimeMillis());
        
        Transaction savedTransaction = transactionService.createTransaction(transaction);
        log.info("Credit refund successful. Transaction ID: {}", savedTransaction.getId());
        
        return savedTransaction;
    }
    
    @Override
    public List<Transaction> getTransactionHistory(User user) {
        return transactionService.getTransactionsByUser(user);
    }
    
    @Override
    public List<Transaction> getTransactionHistory(User user, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return transactionService.getTransactionsByUser(user, pageable).getContent();
    }
    
    @Override
    @Transactional
    public Transaction adjustCredit(User user, BigDecimal amount, String description, String transactionRef) {
        log.info("Admin adjusting {} credits for user {}", amount, user.getId());
        
        // Get balance before transaction
        BigDecimal balanceBefore = user.getCreditBalance();
        
        // Adjust credit
        if (amount.compareTo(BigDecimal.ZERO) > 0) {
            user.addCredit(amount);
        } else {
            user.deductCredit(amount.abs());
        }
        userRepository.save(user);
        
        // Get balance after transaction
        BigDecimal balanceAfter = user.getCreditBalance();
        
        // Create new Transaction record
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(TransactionType.ADMIN_ADJUSTMENT);
        transaction.setMethod(PaymentMethod.CREDIT);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setTransactionRef(transactionRef != null ? transactionRef : Transaction.generateTransactionRef());
        transaction.setGatewayTransactionId("ADMIN_" + System.currentTimeMillis());
        
        Transaction savedTransaction = transactionService.createTransaction(transaction);
        log.info("Credit adjustment successful. Transaction ID: {}", savedTransaction.getId());
        
        return savedTransaction;
    }
}