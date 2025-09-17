package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    List<Schedule> findByProfileIdAndEnableTrue(Integer profileId);
    List<Schedule> findByProfileId(Integer profileId);
    
    void deleteByProfileId(Integer profileId);
} 