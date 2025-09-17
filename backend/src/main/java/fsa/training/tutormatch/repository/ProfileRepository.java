package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.BaseProfile;
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
public interface ProfileRepository extends JpaRepository<BaseProfile, Integer> {
    
    // Find by user ID
    Optional<BaseProfile> findByUserId(Integer userId);
    
    // Query to find approved tutors
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'APPROVED'")
    List<TutorProfile> findApprovedTutors();
    
    // Find tutors by subject
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.subject.name = :subjectName AND p.profileStatus = 'APPROVED'")
    List<TutorProfile> findBySubjectName(@Param("subjectName") String subjectName);
    
    // Search tutors by keyword
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'APPROVED'")
    List<TutorProfile> findByKeyword(@Param("keyword") String keyword);
    
    // Find tutors by location
    @Query("SELECT p FROM TutorProfile p WHERE p.city = :city AND p.profileStatus = 'APPROVED'")
    List<TutorProfile> findByCity(@Param("city") String city);
    
    // Methods for TutorSearchService
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'APPROVED'")
    List<TutorProfile> findTutorsByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT p FROM TutorProfile p JOIN p.profileSubjects ps WHERE ps.subject.name = :subject AND p.profileStatus = 'APPROVED'")
    List<TutorProfile> findTutorsBySubject(@Param("subject") String subject);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.city = :location AND p.profileStatus = 'APPROVED'")
    List<TutorProfile> findTutorsByLocation(@Param("location") String location);
    
    @Query("SELECT p FROM TutorProfile p WHERE (p.bio LIKE %:keyword% OR p.headline LIKE %:keyword% OR p.experience LIKE %:keyword%) AND p.profileStatus = 'APPROVED'")
    Page<TutorProfile> findTutorsByKeywordPaged(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'APPROVED'")
    Page<TutorProfile> findAllTutorsPaged(Pageable pageable);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.profileStatus = 'APPROVED' ORDER BY p.ratePointAverage DESC LIMIT :limit")
    List<TutorProfile> findTopRatedTutors(@Param("limit") int limit);
    
    @Query("SELECT p FROM TutorProfile p WHERE p.fees BETWEEN :minPrice AND :maxPrice AND p.profileStatus = 'APPROVED'")
    List<TutorProfile> findTutorsByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
    
    // Count methods for dashboard
    long countByProfileStatus(BaseProfile.ProfileStatus status);
    
    @Query("SELECT COUNT(p) FROM TutorProfile p WHERE p.profileStatus = 'APPROVED'")
    long countApprovedTutors();
    
    @Query("SELECT COUNT(p) FROM StudentProfile p")
    long countStudents();
}
