package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.enums.UserRole;
import fsa.training.tutormatch.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 🧪 Unit Tests cho UserService
 * 
 * Test Strategy:
 * 1. Mock dependencies (UserRepository, PasswordEncoder)
 * 2. Test business logic only (not database)
 * 3. Verify method calls and return values
 * 4. Test edge cases and error scenarios
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private fsa.training.tutormatch.service.interfaces.IUserService userService;

    private User testUser;
    private User testTutor;

    @BeforeEach
    void setUp() {
        // Setup test data
        testUser = new User();
        testUser.setId(1);
        testUser.setEmail("test@example.com");
        testUser.setUsername("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setPassword("plainPassword");
        testUser.setRole(UserRole.STUDENT);

        testTutor = new User();
        testTutor.setId(2);
        testTutor.setEmail("tutor@example.com");
        testTutor.setUsername("tutor@example.com");
        testTutor.setFirstName("Test");
        testTutor.setLastName("Tutor");
        testTutor.setPassword("plainPassword");
        testTutor.setRole(UserRole.TUTOR);
    }

    // =============== TEST CASE 1: save() method ===============

    /**
     * 🧪 Test Case 1.1: Save new user successfully
     */
    @Test
    void save_ShouldEncodePasswordAndSaveUser_WhenValidUserProvided() {
        // Given
        String encodedPassword = "encodedPassword123";
        when(passwordEncoder.encode("plainPassword")).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User savedUser = userService.save(testUser);

        // Then
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isEqualTo(1);
        assertThat(savedUser.getEmail()).isEqualTo("test@example.com");
        assertThat(savedUser.getRole()).isEqualTo(UserRole.STUDENT);

        // Verify interactions
        verify(passwordEncoder, times(1)).encode("plainPassword");
        verify(userRepository, times(1)).save(testUser);
        
        // Verify password was encoded
        assertThat(testUser.getPassword()).isEqualTo(encodedPassword);
    }

    /**
     * 🧪 Test Case 1.2: Save user with null role should default to STUDENT
     */
    @Test
    void save_ShouldSetDefaultRole_WhenRoleIsNull() {
        // Given
        testUser.setRole(null);
        String encodedPassword = "encodedPassword123";
        when(passwordEncoder.encode(anyString())).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User savedUser = userService.save(testUser);

        // Then
        assertThat(savedUser.getRole()).isEqualTo(UserRole.STUDENT);
        verify(userRepository, times(1)).save(testUser);
    }

    /**
     * 🧪 Test Case 1.3: Save should handle password encoding exception
     */
    @Test
    void save_ShouldThrowException_WhenPasswordEncodingFails() {
        // Given
        when(passwordEncoder.encode(anyString())).thenThrow(new RuntimeException("Encoding failed"));

        // When & Then
        assertThatThrownBy(() -> userService.save(testUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Encoding failed");

        verify(passwordEncoder, times(1)).encode("plainPassword");
        verify(userRepository, never()).save(any());
    }

    // =============== TEST CASE 2: findByUsername() method ===============

    /**
     * 🧪 Test Case 2.1: Find existing user by username
     */
    @Test
    void findByUsername_ShouldReturnUser_WhenUserExists() {
        // Given
        String username = "test@example.com";
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.findByUsername(username);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getUsername()).isEqualTo(username);
        assertThat(result.get().getEmail()).isEqualTo("test@example.com");

        verify(userRepository, times(1)).findByUsername(username);
    }

    /**
     * 🧪 Test Case 2.2: Find non-existing user by username
     */
    @Test
    void findByUsername_ShouldReturnEmpty_WhenUserNotExists() {
        // Given
        String username = "nonexistent@example.com";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.findByUsername(username);

        // Then
        assertThat(result).isEmpty();
        verify(userRepository, times(1)).findByUsername(username);
    }

    /**
     * 🧪 Test Case 2.3: Find user with null username should handle gracefully
     */
    @Test
    void findByUsername_ShouldReturnEmpty_WhenUsernameIsNull() {
        // Given
        when(userRepository.findByUsername(null)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.findByUsername(null);

        // Then
        assertThat(result).isEmpty();
        verify(userRepository, times(1)).findByUsername(null);
    }

    // =============== TEST CASE 3: changePassword() method ===============

    /**
     * 🧪 Test Case 3.1: Change password successfully
     */
    @Test
    void changePassword_ShouldReturnTrue_WhenOldPasswordMatches() {
        // Given
        String username = "test@example.com";
        String oldPassword = "oldPassword";
        String newPassword = "newPassword";
        String encodedOldPassword = "encodedOldPassword";
        String encodedNewPassword = "encodedNewPassword";

        testUser.setPassword(encodedOldPassword);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(oldPassword, encodedOldPassword)).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        boolean result = userService.changePassword(username, oldPassword, newPassword);

        // Then
        assertThat(result).isTrue();
        assertThat(testUser.getPassword()).isEqualTo(encodedNewPassword);

        verify(userRepository, times(1)).findByUsername(username);
        verify(passwordEncoder, times(1)).matches(oldPassword, encodedOldPassword);
        verify(passwordEncoder, times(1)).encode(newPassword);
        verify(userRepository, times(1)).save(testUser);
    }

    /**
     * 🧪 Test Case 3.2: Change password fails when old password doesn't match
     */
    @Test
    void changePassword_ShouldReturnFalse_WhenOldPasswordDoesNotMatch() {
        // Given
        String username = "test@example.com";
        String oldPassword = "wrongPassword";
        String newPassword = "newPassword";
        String encodedOldPassword = "encodedOldPassword";

        testUser.setPassword(encodedOldPassword);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(oldPassword, encodedOldPassword)).thenReturn(false);

        // When
        boolean result = userService.changePassword(username, oldPassword, newPassword);

        // Then
        assertThat(result).isFalse();
        assertThat(testUser.getPassword()).isEqualTo(encodedOldPassword); // Password unchanged

        verify(userRepository, times(1)).findByUsername(username);
        verify(passwordEncoder, times(1)).matches(oldPassword, encodedOldPassword);
        verify(passwordEncoder, never()).encode(newPassword);
        verify(userRepository, never()).save(any());
    }

    /**
     * 🧪 Test Case 3.3: Change password fails when user not found
     */
    @Test
    void changePassword_ShouldReturnFalse_WhenUserNotFound() {
        // Given
        String username = "nonexistent@example.com";
        String oldPassword = "oldPassword";
        String newPassword = "newPassword";

        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When
        boolean result = userService.changePassword(username, oldPassword, newPassword);

        // Then
        assertThat(result).isFalse();

        verify(userRepository, times(1)).findByUsername(username);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }

    // =============== BONUS TEST: getAllTutors() method ===============

    /**
     * 🧪 Bonus Test: Get all tutors
     */
    @Test
    void getAllTutors_ShouldReturnOnlyTutors() {
        // Given
        User tutor1 = new User();
        tutor1.setId(1);
        tutor1.setRole(UserRole.TUTOR);
        
        User tutor2 = new User();
        tutor2.setId(2);
        tutor2.setRole(UserRole.TUTOR);

        List<User> tutors = Arrays.asList(tutor1, tutor2);
        when(userRepository.findByRole(UserRole.TUTOR)).thenReturn(tutors);

        // When
        List<User> result = userService.getAllTutors();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(user -> user.getRole() == UserRole.TUTOR);

        verify(userRepository, times(1)).findByRole(UserRole.TUTOR);
    }
}