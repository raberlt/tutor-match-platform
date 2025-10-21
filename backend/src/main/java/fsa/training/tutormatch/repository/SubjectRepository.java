package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Subject;
// import fsa.training.tutormatch.enums.SubjectCategory;
// import fsa.training.tutormatch.enums.SubjectLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    // Page<Subject> findByCategory(SubjectCategory category, Pageable pageable);
    // Page<Subject> findByLevel(SubjectLevel level, Pageable pageable);
    // long countByIsActive(Boolean isActive);
    
    // Find by name
    Subject findByName(String name);
}