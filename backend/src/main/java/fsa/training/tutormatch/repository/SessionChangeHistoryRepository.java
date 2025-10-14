package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.SessionChangeHistory;
import fsa.training.tutormatch.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionChangeHistoryRepository extends JpaRepository<SessionChangeHistory, Long> {
    
    /**
     * Find all change history for a specific session, ordered by changed date descending
     */
    List<SessionChangeHistory> findBySessionOrderByChangedAtDesc(Session session);
    
    /**
     * Find all change history for a specific session by session ID
     */
    @Query("SELECT sch FROM SessionChangeHistory sch WHERE sch.session.id = :sessionId ORDER BY sch.changedAt DESC")
    List<SessionChangeHistory> findBySessionIdOrderByChangedAtDesc(@Param("sessionId") Long sessionId);
    
    /**
     * Count total reschedules for a session
     */
    long countBySession(Session session);
    
    /**
     * Count total reschedules for a session by session ID
     */
    @Query("SELECT COUNT(sch) FROM SessionChangeHistory sch WHERE sch.session.id = :sessionId")
    long countBySessionId(@Param("sessionId") Long sessionId);
}
