package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RateRepository extends JpaRepository<Rate, Long> {
    
    @Query("SELECT r FROM Rate r WHERE r.booking.tutor.id = :tutorId AND r.visible = true AND r.ratePoint IS NOT NULL")
    List<Rate> findVisibleRatesByTutorId(@Param("tutorId") Integer tutorId);
    
    @Query("SELECT AVG(r.ratePoint) FROM Rate r WHERE r.booking.tutor.id = :tutorId AND r.visible = true AND r.ratePoint IS NOT NULL")
    Double findAverageRatingByTutorId(@Param("tutorId") Integer tutorId);
} 