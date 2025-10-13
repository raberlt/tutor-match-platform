package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.CreditTransaction;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.CreditTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Integer> {
    
    List<CreditTransaction> findByUserOrderByCreatedAtDesc(User user);
    Page<CreditTransaction> findByUser(User user, Pageable pageable);
    
    List<CreditTransaction> findByUserAndTransactionTypeOrderByCreatedAtDesc(User user, CreditTransactionType type);
    
    List<CreditTransaction> findByReferenceId(String referenceId);
    
    long countByUser(User user);
    long countByUserAndTransactionType(User user, CreditTransactionType type);
}
