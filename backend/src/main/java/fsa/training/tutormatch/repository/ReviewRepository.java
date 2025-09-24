package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Page<Review> findByRating(Integer rating, Pageable pageable);
    Page<Review> findByIsVerified(Boolean isVerified, Pageable pageable);
    Page<Review> findByIsPublic(Boolean isPublic, Pageable pageable);
    long countByIsVerified(Boolean isVerified);
    long countByIsPublic(Boolean isPublic);
}
