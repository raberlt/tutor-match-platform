package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Profile;
import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.enums.ProfileStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    
    // Find by user ID
    Optional<Profile> findByUserId(Integer userId);
    
    // Query to find approved tutors
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findApprovedTutors();
    
    // Find tutors by subject
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.subject.name = :subjectName AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findBySubjectName(@Param("subjectName") String subjectName);
    
    // Search tutors by keyword
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findByKeyword(@Param("keyword") String keyword);
    
    // Find tutors by location - REMOVED: city field no longer exists
    
    // Methods for TutorSearchService
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.subject.name = :subject AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsBySubject(@Param("subject") String subject);
    
    // REMOVED: findTutorsByLocation - city field no longer exists
    
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'ACTIVE'")
    Page<TutorProfile> findTutorsByKeywordPaged(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE'")
    Page<TutorProfile> findAllTutorsPaged(Pageable pageable);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE' ORDER BY p.ratePointAverage DESC LIMIT :limit")
    List<TutorProfile> findTopRatedTutors(@Param("limit") int limit);
    
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.fees BETWEEN :minPrice AND :maxPrice AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
    
    // Count methods for dashboard
    long countByProfileStatus(ProfileStatus status);
    
    @Query("SELECT COUNT(p) FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE'")
    long countApprovedTutors();
    
    @Query("SELECT COUNT(p) FROM StudentProfile p")
    long countStudents();
}
