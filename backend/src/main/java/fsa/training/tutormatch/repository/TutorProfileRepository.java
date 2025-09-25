package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.TutorProfile;
import fsa.training.tutormatch.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, Integer> {
    
    // Find by user ID
    Optional<TutorProfile> findByUserId(Integer userId);
    Optional<TutorProfile> findByUser_Username(String username);
    Optional<TutorProfile> findByUser(User user);    
    // Query to find enabled tutors
    @Query("SELECT p FROM TutorProfile p WHERE p.enable = true")
    List<TutorProfile> findApprovedTutors();
    
    // Find tutors by subject
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.subject.name = :subjectName AND p.enable = true")
    List<TutorProfile> findBySubjectName(@Param("subjectName") String subjectName);
    
    // Search tutors by keyword
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.enable = true")
    List<TutorProfile> findByKeyword(@Param("keyword") String keyword);
    
    // REMOVED: findByCity - city field no longer exists
    
    // Methods for TutorSearchService
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.enable = true")
    List<TutorProfile> findTutorsByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.subject.name = :subject AND p.enable = true")
    List<TutorProfile> findTutorsBySubject(@Param("subject") String subject);
    
    // REMOVED: findTutorsByLocation - city field no longer exists
    
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.enable = true")
    Page<TutorProfile> findTutorsByKeywordPaged(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.enable = true")
    Page<TutorProfile> findAllTutorsPaged(Pageable pageable);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.enable = true ORDER BY p.ratePointAverage DESC")
    List<TutorProfile> findTopRatedTutors(@Param("limit") int limit);
    
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.fees BETWEEN :minPrice AND :maxPrice AND p.enable = true")
    List<TutorProfile> findTutorsByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
    
    // Count methods for dashboard
    @Query("SELECT COUNT(p) FROM TutorProfile p WHERE p.enable = true")
    long countApprovedTutors();
    
    // Find all pending applications for admin review
    @Query("SELECT p FROM TutorProfile p WHERE p.enable = false")
    List<TutorProfile> findAllPendingApplications();
    
    // Find public profiles only (for student search)
    @Query("SELECT p FROM TutorProfile p WHERE p.enable = true")
    List<TutorProfile> findAllPublicProfiles();
    
    // Check if user has both draft and public profiles
    @Query("SELECT COUNT(p) FROM TutorProfile p WHERE p.user = :user")
    long countByUser(@Param("user") User user);
}
