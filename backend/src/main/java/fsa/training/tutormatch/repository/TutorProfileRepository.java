package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.TutorProfile;
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
    
    // Query to find approved tutors
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findApprovedTutors();
    
    // Find tutors by subject
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.subject.name = :subjectName AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findBySubjectName(@Param("subjectName") String subjectName);
    
    // Search tutors by keyword
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findByKeyword(@Param("keyword") String keyword);
    
    // Find tutors by location
    @Query("SELECT p FROM TutorProfile p WHERE p.city = :city AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findByCity(@Param("city") String city);
    
    // Methods for TutorSearchService
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.subject.name = :subject AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsBySubject(@Param("subject") String subject);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.city = :location AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsByLocation(@Param("location") String location);
    
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'ACTIVE'")
    Page<TutorProfile> findTutorsByKeywordPaged(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE'")
    Page<TutorProfile> findAllTutorsPaged(Pageable pageable);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE' ORDER BY p.ratePointAverage DESC")
    List<TutorProfile> findTopRatedTutors(@Param("limit") int limit);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.fees BETWEEN :minPrice AND :maxPrice AND p.profileStatus = 'ACTIVE'")
    List<TutorProfile> findTutorsByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
    
    // Count methods for dashboard
    @Query("SELECT COUNT(p) FROM TutorProfile p WHERE p.profileStatus = 'ACTIVE'")
    long countApprovedTutors();
}
