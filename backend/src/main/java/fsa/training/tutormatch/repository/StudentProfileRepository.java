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
    
    // Note: learningGoals, preferredSubjects, budgetMin, budgetMax fields were removed from StudentProfile
    // These queries are no longer available
    
    // Count total students
    long count();
}
