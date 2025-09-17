package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Integer> {
    List<Certificate> findByProfileId(Integer profileId);
    void deleteByProfileId(Integer profileId);
} 