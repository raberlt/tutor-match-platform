package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.TrialSession;
import fsa.training.tutormatch.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrialSessionRepository extends JpaRepository<TrialSession, Integer> {
    
    /**
     * Kiểm tra xem học viên đã học thử với gia sư này chưa
     */
    @Query("SELECT ts FROM TrialSession ts WHERE ts.student = :student AND ts.tutor = :tutor")
    Optional<TrialSession> findByStudentAndTutor(@Param("student") User student, @Param("tutor") User tutor);
    
    /**
     * Kiểm tra xem học viên đã hoàn thành học thử với gia sư này chưa
     */
    @Query("SELECT ts FROM TrialSession ts WHERE ts.student = :student AND ts.tutor = :tutor AND ts.completedAt IS NOT NULL")
    Optional<TrialSession> findCompletedTrialByStudentAndTutor(@Param("student") User student, @Param("tutor") User tutor);
    
    /**
     * Đếm số lần học thử đã hoàn thành của học viên với gia sư
     */
    @Query("SELECT COUNT(ts) FROM TrialSession ts WHERE ts.student = :student AND ts.tutor = :tutor AND ts.completedAt IS NOT NULL")
    long countCompletedTrialsByStudentAndTutor(@Param("student") User student, @Param("tutor") User tutor);
}

