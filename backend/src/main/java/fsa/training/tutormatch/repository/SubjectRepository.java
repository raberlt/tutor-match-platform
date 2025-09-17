package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
 
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
} 