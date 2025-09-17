package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.BaseProfile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaseProfileRepository extends JpaRepository<BaseProfile, Integer> {
    
    // Common queries
    Optional<BaseProfile> findByUserId(Integer userId);
    List<BaseProfile> findByProfileStatus(BaseProfile.ProfileStatus status);
    
    // Type-specific queries using JPQL
    @Query("SELECT p FROM StudentProfile p WHERE p.user.id = :userId")
    Optional<StudentProfile> findStudentProfileByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.user.id = :userId")
    Optional<TutorProfile> findTutorProfileByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = :status")
    List<TutorProfile> findTutorProfilesByStatus(@Param("status") BaseProfile.ProfileStatus status);
    
    @Query("SELECT p FROM StudentProfile p WHERE p.profileStatus = :status")
    List<StudentProfile> findStudentProfilesByStatus(@Param("status") BaseProfile.ProfileStatus status);
    
    // Business queries
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE' AND p.isVerified = true")
    List<TutorProfile> findActiveTutors();
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'PENDING_VERIFICATION'")
    List<TutorProfile> findPendingTutorApplications();
    
    @Query("SELECT COUNT(p) FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE'")
    long countActiveTutors();
    
    @Query("SELECT COUNT(p) FROM StudentProfile p WHERE p.profileStatus = 'ACTIVE'")
    long countActiveStudents();
    
    // Advanced queries
    @Query("SELECT p FROM TutorProfile p WHERE p.fees BETWEEN :minFee AND :maxFee AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsByFeeRange(@Param("minFee") Integer minFee, @Param("maxFee") Integer maxFee);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.city = :city AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsByCity(@Param("city") String city);
} 
 
 