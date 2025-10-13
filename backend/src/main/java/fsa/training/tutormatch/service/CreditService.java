package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.CreditTransaction;
import fsa.training.tutormatch.entity.User;

import java.math.BigDecimal;
import java.util.List;

public interface CreditService {
    
    // Credit balance management
    BigDecimal getCurrentBalance(User user);
    boolean hasEnoughCredit(User user, BigDecimal amount);
    
    // Credit transactions
    CreditTransaction depositCredit(User user, BigDecimal amount, String description, String referenceId);
    CreditTransaction withdrawCredit(User user, BigDecimal amount, String description, String referenceId);
    CreditTransaction payWithCredit(User user, BigDecimal amount, String description, String referenceId);
    CreditTransaction refundCredit(User user, BigDecimal amount, String description, String referenceId);
    
    // Transaction history
    List<CreditTransaction> getTransactionHistory(User user);
    List<CreditTransaction> getTransactionHistory(User user, int limit);
    
    // Admin functions
    CreditTransaction adjustCredit(User user, BigDecimal amount, String description, String referenceId);
}
