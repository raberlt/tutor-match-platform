package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
}
