package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TutorRepository  extends JpaRepository<User, Integer> {
    @Query("SELECT u FROM User u WHERE u.role = 'TUTOR'")
//    @Query("""
//    SELECT DISTINCT u
//    FROM User u
//    JOIN FETCH u.profile p
//    LEFT JOIN FETCH p.profileSubjects ps
//    LEFT JOIN FETCH ps.subject
//    WHERE u.role = 'TUTOR'
//    """)
    List<User> findAllTutors();
}
