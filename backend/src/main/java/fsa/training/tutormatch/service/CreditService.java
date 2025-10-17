package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.Transaction;
import fsa.training.tutormatch.entity.User;

import java.math.BigDecimal;
import java.util.List;

public interface CreditService {
    
    // Credit balance management
    BigDecimal getCurrentBalance(User user);
    boolean hasEnoughCredit(User user, BigDecimal amount);
    
    // Credit transactions
    Transaction depositCredit(User user, BigDecimal amount, String description, String transactionRef);
    Transaction withdrawCredit(User user, BigDecimal amount, String description, String transactionRef);
    Transaction payWithCredit(User user, BigDecimal amount, String description, String transactionRef);
    Transaction refundCredit(User user, BigDecimal amount, String description, String transactionRef);
    
    // Transaction history
    List<Transaction> getTransactionHistory(User user);
    List<Transaction> getTransactionHistory(User user, int limit);
    
    // Admin functions
    Transaction adjustCredit(User user, BigDecimal amount, String description, String transactionRef);
}
