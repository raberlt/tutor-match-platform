package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RateRepository extends JpaRepository<Rate, Integer> {

    @Query("SELECT AVG(r.ratePoint) FROM Rate r " +
            "JOIN r.booking b " +
            "JOIN b.tutor t " +
            "WHERE t.id = :tutorId")
    Double findAverageRateByTutorId(@Param("tutorId") Integer tutorId);
}
