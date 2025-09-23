package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Payment;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    
    List<Payment> findByStudentOrderByCreatedAtDesc(User student);
    
    List<Payment> findByTutorOrderByCreatedAtDesc(User tutor);
    
    List<Payment> findByStatus(PaymentStatus status);
    
    Optional<Payment> findByTransactionId(String transactionId);
    
    List<Payment> findByBookingId(Integer bookingId);
    
    // Admin pagination methods
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
    
    Page<Payment> findByStudent(User student, Pageable pageable);
    
    Page<Payment> findByTutor(User tutor, Pageable pageable);
    
    // Count methods for statistics
    long countByStatus(PaymentStatus status);
    
    // Sum methods for revenue calculation
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);
} 