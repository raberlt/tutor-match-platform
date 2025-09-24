package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ApplicationCertificate;
import fsa.training.tutormatch.entity.ProfileApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationCertificateRepository extends JpaRepository<ApplicationCertificate, Long> {
    
    List<ApplicationCertificate> findByApplication(ProfileApplication application);
    
    void deleteByApplication(ProfileApplication application);
}
