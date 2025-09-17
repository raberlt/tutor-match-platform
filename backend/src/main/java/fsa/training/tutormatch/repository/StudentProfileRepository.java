package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Integer> {
    
    // Find by user ID
    Optional<StudentProfile> findByUserId(Integer userId);
    Optional<StudentProfile> findByUser_Username(String username);
    
    // Find students by learning goals
    @Query("SELECT s FROM StudentProfile s WHERE s.learningGoals LIKE %:keyword%")
    List<StudentProfile> findByLearningGoalsContaining(@Param("keyword") String keyword);
    
    // Find students by preferred subjects
    @Query("SELECT s FROM StudentProfile s WHERE s.preferredSubjects LIKE %:subject%")
    List<StudentProfile> findByPreferredSubjectsContaining(@Param("subject") String subject);
    
    // Find students by budget range
    @Query("SELECT s FROM StudentProfile s WHERE s.budgetMin <= :maxBudget AND s.budgetMax >= :minBudget")
    List<StudentProfile> findByBudgetRange(@Param("minBudget") Integer minBudget, @Param("maxBudget") Integer maxBudget);
    
    // Count total students
    long count();
}
