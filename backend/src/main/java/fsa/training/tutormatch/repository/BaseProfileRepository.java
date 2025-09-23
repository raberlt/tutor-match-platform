package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.StudentProfile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.enums.ProfileStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaseProfileRepository extends JpaRepository<Profile, Integer> {
    
    // Common queries
    Optional<Profile> findByUserId(Integer userId);
    List<Profile> findByProfileStatus(ProfileStatus status);
    
    // Type-specific queries using JPQL
    @Query("SELECT p FROM StudentProfile p WHERE p.user.id = :userId")
    Optional<StudentProfile> findStudentProfileByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.user.id = :userId")
    Optional<TutorProfile> findTutorProfileByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = :status")
    List<TutorProfile> findTutorProfilesByStatus(@Param("status") ProfileStatus status);
    
    @Query("SELECT p FROM StudentProfile p WHERE p.profileStatus = :status")
    List<StudentProfile> findStudentProfilesByStatus(@Param("status") ProfileStatus status);
    
    // Business queries
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE' AND p.user.isVerified = true")
    List<TutorProfile> findActiveTutors();
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'PENDING_VERIFICATION'")
    List<TutorProfile> findPendingTutorApplications();
    
    @Query("SELECT COUNT(p) FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE'")
    long countActiveTutors();
    
    @Query("SELECT COUNT(p) FROM StudentProfile p WHERE p.profileStatus = 'ACTIVE'")
    long countActiveStudents();
    
    // Advanced queries
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.fees BETWEEN :minFee AND :maxFee AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsByFeeRange(@Param("minFee") Integer minFee, @Param("maxFee") Integer maxFee);
    
    // REMOVED: findTutorsByCity - city field no longer exists
} 
 
 