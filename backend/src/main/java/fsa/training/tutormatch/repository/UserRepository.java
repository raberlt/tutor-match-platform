package fsa.training.tutormatch.repository;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);

    List<User> findByRole(UserRole role);
    
    // Search methods for admin
    Page<User> findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String username, String firstName, String lastName, String email, Pageable pageable);
    
    // Filter by role with pagination
    List<User> findByRoleAndUsernameContainingIgnoreCase(UserRole role, String username);
    
    Page<User> findByRole(UserRole role, Pageable pageable);
    
    // Count methods for statistics
    long countByRole(UserRole role);
    // long countByEnabled(boolean enabled); // enabled field removed from User entity
    long countByCreatedAtAfter(ZonedDateTime date);
    
    // Exists methods
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    // Find by username containing
    List<User> findByUsernameContaining(String username);
    
    // Find by email containing (for test data cleanup)
    List<User> findByEmailContaining(String email);
}


