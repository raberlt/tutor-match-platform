package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.ProfileApplication;
import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.ApplicationStatus;
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
    
    // Find applications by status
    Page<ProfileApplication> findByStatusOrderByCreatedAtDesc(ApplicationStatus status, Pageable pageable);
    
    // Check if user has pending applications
    @Query("SELECT COUNT(a) > 0 FROM ProfileApplication a WHERE a.user = :user AND a.status = 'SUBMITTED'")
    boolean hasPendingApplications(@Param("user") User user);
    
    // Get latest application by user
    @Query("SELECT a FROM ProfileApplication a WHERE a.user = :user ORDER BY a.createdAt DESC LIMIT 1")
    Optional<ProfileApplication> findLatestByUser(@Param("user") User user);
    
    // Count applications by status
    long countByStatus(ApplicationStatus status);
}
