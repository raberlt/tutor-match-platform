package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    List<User> findByRole(User.Role role);
    
    // Search methods for admin
    Page<User> findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String username, String firstName, String lastName, String email, Pageable pageable);
    
    // Filter by role with pagination
    Page<User> findByRole(User.Role role, Pageable pageable);
    
    // Count methods for statistics
    long countByRole(User.Role role);
    long countByEnabled(boolean enabled);
    long countByCreatedAtAfter(Timestamp date);
    
    // Exists methods
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}


