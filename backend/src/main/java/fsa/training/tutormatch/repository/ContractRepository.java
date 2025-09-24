package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Contract;
import fsa.training.tutormatch.enums.ContractStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {
    Page<Contract> findByStatus(ContractStatus status, Pageable pageable);
}