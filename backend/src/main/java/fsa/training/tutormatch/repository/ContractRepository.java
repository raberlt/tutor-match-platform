package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Contract;
import fsa.training.tutormatch.enums.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {
    
    // Find by booking ID
    Optional<Contract> findByBookingId(Integer bookingId);
    
    // Find contracts by status
    List<Contract> findByContractStatus(ContractStatus status);
    
    // Find contracts by student
    @Query("SELECT c FROM Contract c JOIN c.booking b WHERE b.student.id = :studentId")
    List<Contract> findByStudentId(@Param("studentId") Integer studentId);
    
    // Find contracts by tutor
    @Query("SELECT c FROM Contract c JOIN c.booking b WHERE b.tutor.id = :tutorId")
    List<Contract> findByTutorId(@Param("tutorId") Integer tutorId);
    
    // Find active contracts
    @Query("SELECT c FROM Contract c WHERE c.contractStatus = 'ACTIVE'")
    List<Contract> findActiveContracts();
    
    // Find contracts expiring soon (within 7 days)
    @Query("SELECT c FROM Contract c WHERE c.endDate <= CURRENT_DATE + 7 DAY AND c.contractStatus = 'ACTIVE'")
    List<Contract> findContractsExpiringSoon();
}
