package fsa.training.tutormatch.service.impl;

import fsa.training.tutormatch.entity.CreditTransaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.enums.CreditTransactionType;
import fsa.training.tutormatch.enums.TransactionStatus;
import fsa.training.tutormatch.repository.CreditTransactionRepository;
import fsa.training.tutormatch.repository.UserRepository;
import fsa.training.tutormatch.service.CreditService;
import fsa.training.tutormatch.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
    
    private final CreditTransactionRepository creditTransactionRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    
    // Temporarily disabled until database migration
    @Override
    @Transactional
    public CreditTransaction depositCredit(User user, BigDecimal amount, String description, String referenceId) {
        log.info("Depositing {} credits to user {}", amount, user.getId());
        
        // Get balance before transaction
        BigDecimal balanceBefore = user.getCreditBalance();
        
        // Add credit to user
        user.addCredit(amount);
        userRepository.save(user);
        
        // Get balance after transaction
        BigDecimal balanceAfter = user.getCreditBalance();
        
        // Create new Transaction record
        Transaction transaction = transactionService.createDepositTransaction(user, amount, description);
        
        // Update balance tracking
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transactionService.updateTransaction(transaction.getId(), transaction);
        
        // Legacy: Create CreditTransaction for backward compatibility (will be removed after migration)
        CreditTransaction creditTransaction = new CreditTransaction();
        creditTransaction.setUser(user);
        creditTransaction.setAmount(amount);
        creditTransaction.setTransactionType(CreditTransactionType.DEPOSIT);
        creditTransaction.setDescription(description);
        creditTransaction.setReferenceId(referenceId);
        creditTransaction.setBalanceBefore(balanceBefore);
        creditTransaction.setBalanceAfter(balanceAfter);
        
        CreditTransaction savedCreditTransaction = creditTransactionRepository.save(creditTransaction);
        log.info("Credit deposit successful. Transaction ID: {}", savedCreditTransaction.getId());
        
        return savedCreditTransaction;
    }
    
    @Override
    @Transactional
    public CreditTransaction withdrawCredit(User user, BigDecimal amount, String description, String referenceId) {
        log.warn("Credit system is temporarily disabled. Migration required.");
        throw new UnsupportedOperationException("Credit system is temporarily disabled. Please run database migration first.");
    }
    
    @Override
    @Transactional
    public CreditTransaction payWithCredit(User user, BigDecimal amount, String description, String referenceId) {
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
        
        // Create transaction record
        CreditTransaction transaction = new CreditTransaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setTransactionType(CreditTransactionType.PAYMENT);
        transaction.setDescription(description);
        transaction.setReferenceId(referenceId);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        
        CreditTransaction savedTransaction = creditTransactionRepository.save(transaction);
        log.info("Credit payment successful. Transaction ID: {}", savedTransaction.getId());
        
        return savedTransaction;
    }
    
    @Override
    @Transactional
    public CreditTransaction refundCredit(User user, BigDecimal amount, String description, String referenceId) {
        log.warn("Credit system is temporarily disabled. Migration required.");
        throw new UnsupportedOperationException("Credit system is temporarily disabled. Please run database migration first.");
    }
    
    @Override
    @Transactional
    public CreditTransaction adjustCredit(User user, BigDecimal amount, String description, String referenceId) {
        log.warn("Credit system is temporarily disabled. Migration required.");
        throw new UnsupportedOperationException("Credit system is temporarily disabled. Please run database migration first.");
    }
    
    @Override
    public boolean hasEnoughCredit(User user, BigDecimal amount) {
        return user.hasEnoughCredit(amount);
    }
    
    @Override
    public BigDecimal getCurrentBalance(User user) {
        return user.getCreditBalance();
    }
    
    @Override
    public List<CreditTransaction> getTransactionHistory(User user) {
        log.warn("Credit system is temporarily disabled. Migration required.");
        return List.of();
    }
    
    @Override
    public List<CreditTransaction> getTransactionHistory(User user, int limit) {
        log.warn("Credit system is temporarily disabled. Migration required.");
        return List.of();
    }
}