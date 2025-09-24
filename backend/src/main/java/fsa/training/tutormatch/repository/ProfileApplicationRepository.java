package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ProfileApplication;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.ApplicationStatus;
import fsa.training.tutormatch.enums.ApplicationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileApplicationRepository extends JpaRepository<ProfileApplication, Long> {
    
    // Find applications by user
    List<ProfileApplication> findByUserOrderByCreatedAtDesc(User user);
    
    // Find applications by user and status
    List<ProfileApplication> findByUserAndStatusOrderByCreatedAtDesc(User user, ApplicationStatus status);
    
    // Find applications by user and type
    List<ProfileApplication> findByUserAndApplicationTypeOrderByCreatedAtDesc(User user, ApplicationType type);
    
    // Find draft applications by user and type
    Optional<ProfileApplication> findByUserAndApplicationTypeAndStatus(User user, ApplicationType type, ApplicationStatus status);
    
    // Find applications by status
    Page<ProfileApplication> findByStatusOrderByCreatedAtDesc(ApplicationStatus status, Pageable pageable);
    
    // Find applications by status and type
    Page<ProfileApplication> findByStatusAndApplicationTypeOrderByCreatedAtDesc(ApplicationStatus status, ApplicationType type, Pageable pageable);
    
    // Check if user has pending applications
    @Query("SELECT COUNT(a) > 0 FROM ProfileApplication a WHERE a.user = :user AND a.status IN ('SUBMITTED', 'UNDER_REVIEW')")
    boolean hasPendingApplications(@Param("user") User user);
    
    // Get latest application by user and type
    @Query("SELECT a FROM ProfileApplication a WHERE a.user = :user AND a.applicationType = :type ORDER BY a.createdAt DESC LIMIT 1")
    Optional<ProfileApplication> findLatestByUserAndType(@Param("user") User user, @Param("type") ApplicationType type);
    
    // Count applications by status
    long countByStatus(ApplicationStatus status);
    
    // Count applications by status and type
    long countByStatusAndApplicationType(ApplicationStatus status, ApplicationType type);
}
